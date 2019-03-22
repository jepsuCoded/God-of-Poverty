var Engine = (function () {
    'use strict';

    function formatScientificNumber(val, decimals) {
        return val.toExponential(decimals);
    }

    const postfixes = ["", "k", "M", "B", "T", "q", "Q", "s", "S", "O", "N", 
                       "D", "Ud", "Dd", "Td", "qd", "Qd", "sd", "Sd", "Od", "Nd", 
                       "V", "Uv", "Dv", "Tv", "qv", "Qv", "sv", "Sv", "Ov", "Nv"];

    function formatDictionaryNumber(val, decimals) {
        const components = val.toExponential(decimals).split("e");
        const roundValTo = (val, roundTo) => { return Math.floor(val/roundTo)*roundTo };
        const getPostFix = (exp) => { return postfixes[Math.floor(exp/3)] };
        let [str, exp] = components;

        exp = parseInt(exp);

        str = (val / Math.pow(10, roundValTo(Math.max(0, exp), 3))).toFixed(decimals) + getPostFix(Math.max(0, exp));

        return str;
    }

    const postfixes$1 = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function formatAbstractNumber(val, decimals) {
        const components = val.toExponential(decimals).split("e");
        const roundValTo = (val, roundTo) => { return Math.floor(val/roundTo)*roundTo };
        const getPostFix = (exp) => { return postfixes$1[Math.floor(exp/3)] };
        let [str, exp] = components;

        exp = parseInt(exp);

        str = (val / Math.pow(10, roundValTo(Math.max(0, exp), 3))).toFixed(decimals) + getPostFix(Math.max(0, exp));

        return str;
    }

    class EventEmitter {
        constructor() {
            this.events = {};
        }

        on(event, listener) {
            if (typeof this.events[event] !== 'object') {
                this.events[event] = [];
            }
            this.events[event].push(listener);
            return () => this.removeListener(event, listener);
        }

        off(event) {
            if (typeof this.events[event] === 'object') {
                this.events[event] = [];
            }
        }

        removeListener(event, listener) {
            if (typeof this.events[event] === 'object') {
                const idx = this.events[event].indexOf(listener);
                if (idx > -1) {
                    this.events[event].splice(idx, 1);
                }
            }
        }

        emit(event, ...args) {
            if (typeof this.events[event] === 'object') {
                this.events[event].forEach(listener => listener.apply(this, args));
            }
        }
        
        once(event, listener) {
            const remove = this.on(event, (...args) => {
                remove();
                listener.apply(this, args);
            });
        }
    }

    class Currency extends EventEmitter {
        constructor(type, initialValue) {
            super();
            this.state = {
                type: type,
                value: initialValue
            };
        }

        get value() {
            return this.state.value;
        }

        get type() {
            return this.state.type;
        }

        set value(v) {
            this.state.value = v;
        }

        serialise() {
            return this.state;
        }

        deserialise(o) {
            this.state = o;
        }

        incrementBy(value) {
            this.value += value;
            this.emit("CURRENCY_UPDATED", {
                obj: this,
                type: this.state.type,
                value: this.state.value,
                delta: value
            });
        }
    }

    class Entity extends EventEmitter {
        constructor(type, opts) {
            super();

            this.state = {
                type: type,
                key: opts.key,
                count: opts.count || 0,
                maxCount: opts.maxCount || Number.MAX_VALUE,
            };
            this.requirements = opts.requirements;
            if ( this.requirements ) console.log(this.requirements);
            this.lastProcessed = 0;
            this.engine = opts.engine;
        }

        get type()              { return this.state.type }
        get key()               { return this.state.key }
        get count()             { return this.state.count }
        get maxCount()          { return this.state.maxCount }

        serialise() {
            return this.state;
        }

        deserialise(o) {
            this.state = o;
        }

        incrementBy(val) {
            const origValue = this.state.count;
            let diff = 0;
            this.state.count = Math.min(this.state.count + val, this.state.maxCount);
            if ( this.state.count < 0 ) this.state.count = 0;

            diff = this.state.count - origValue;

            if (diff !== 0) {
                this.emit(this.state.type.toUpperCase() + "_COUNT_UPDATED", {
                    obj: this,
                    key: this.state.key,
                    count: this.state.count,
                    delta: diff
                });
            }

            return diff
        }

        requirementsMet() {
            if (this.requirements) {
                for (const cat in this.requirements) {
                    for (const key in this.requirements[cat]) {
                        if ( this.engine[cat] && this.engine[cat][key] ) {
                            if ( this.engine[cat][key].count < this.requirements[cat][key] )
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        onTick(dt) {
            if (this.canProcess(dt)) {
                this.processTick(dt);
                // constraint check
                if (this.count > this.maxCount) this.count = this.maxCount;
                this.lastProcessed = dt;
            }
        }

        processTick(dt) {
            this.count += calculateIncrement(dt);
        }

        canProcess(dt) {
            return this.count > 0;
        }
    }

    class Producer extends Entity {
        constructor(opts) {
            super("producer", opts);
            this.state.baseCost = opts.baseCost;
            this.state.costCoefficient = opts.costCoefficient || 1;
            this.state.consumedInputs = {};
            this.state.processingEnabled = (typeof opts.processingEnabled === 'boolean' ? opts.processingEnabled : true);
            this.inputs = opts.inputs || {};
            this.outputs = opts.outputs || { resources: {}, producers: {} };
            // set the 'lastProcessed' timestamp to creation time
            if ( this.state.processingEnabled === true ) {
                for (const type in this.outputs) {
                    for (const key in this.outputs[type]) {
                        this.outputs[type][key].lastProcessed = Date.now();
                    }
                }
            }

            this.postProcessors = opts.postProcessors;
        }

        get baseCost() {
            return this.state.baseCost;
        }

        get costCoefficient() {
            return this.state.costCoefficient;
        }

        get consumedInputs() {
            return this.state.consumedInputs;
        }

        get processingEnabled() {
            return this.state.processingEnabled;
        }

        set processingEnabled(flag) {
            if (typeof flag === 'boolean') {
                if ( flag !== this.state.processingEnabled ) {
                    this.state.processingEnabled = flag;
                    for (const key in this.outputs.resources) {
                        this.outputs.resources[key].lastProcessed = flag ? Date.now() : null;
                    }
                }
            } else {
                throw `Invalid value ${flag} passed as value to Producer.processingEnabled`;
            }
        }

        resetTimers() {
            for (const type in this.inputs) {
                for (const key in this.inputs[type]) {
                    delete this.inputs[type][key].lastProcessed;
                }
            }
            for (const type in this.outputs) {
                for (const key in this.outputs[type]) {
                    delete this.outputs[type][key].lastProcessed;
                }
            }
        }

        calculateCost(count) {
            let cost = null;

            if (this.state.baseCost) {
                cost = { currency: this.state.baseCost.currency, price: 0 };
                for (let i = 0; i < count; i++) {
                    cost.price += Math.round(this.state.baseCost.amount * Math.pow(this.state.costCoefficient, this.state.count + i));
                }
            }
            return cost;
        }

        addOutput(outputType, outputKey, productionTime, productionAmount) {
            outputType += 's';
            this.outputs[outputType] == this.outputs[outputType] || {};
            this.outputs[outputType][outputKey] = this.outputs[outputType][outputKey] || {};
            this.outputs[outputType][outputKey].productionTime = productionTime;
            this.outputs[outputType][outputKey].productionAmount = productionAmount;

            return this;
        }

        getOutput(outputType, outputKey) {
            let result = null;
            if (this.outputs[outputType]) {
                result = this.outputs[outputType][outputKey];
            }
            return result;
        }

        processTick(dt) {
            let lastProcessed, rules, obj;
            const result = this.state.consumedInputs;

            const processInputs = () => {
                // loop through the input categories
                Object.keys(this.inputs).map((cat) => {
                    Object.keys(this.inputs[cat]).map((input) => {
                        rules = this.inputs[cat][input];
                        lastProcessed = rules.lastProcessed;
                        obj = this.engine[cat][input];
                        
                        if (lastProcessed) {
                            if (obj) {
                                if (rules.consumptionTime > 0 && dt - lastProcessed >= rules.consumptionTime) {
                                    let consumeBy = Math.min(obj.count, (this.state.count * rules.consumptionAmount * Math.trunc((dt-lastProcessed)/rules.consumptionTime)));

                                    obj.incrementBy(-consumeBy);
                                    if (consumeBy) {
                                        result[cat] = result[cat] || {};
                                        result[cat][input] = result[cat][input] || { amount: 0 };
                                        result[cat][input].amount += consumeBy;
                                    }
                                    rules.lastProcessed = dt;
                                }
                            } else {
                                throw `Input object not found:\n\tType: ${cat}\n\tKey: ${input}`
                            }
                        } else {
                            rules.lastProcessed = dt;
                        }
                    });
                });
            };

            const processOutputs = () => {
                const inputRequirementsMet = (reqs) => {
                    if (!reqs) return true;

                    for (const rc of reqs) {
                        if ( this.state.consumedInputs[rc.category] && this.state.consumedInputs[rc.category][rc.key] ) {
                            if (this.state.consumedInputs[rc.category][rc.key].amount < rc.amount) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                    return true;
                };

                const clampByConsumedInputs = (count, reqs) => {
                    if (!reqs) return count;

                    for (const rc of reqs) {
                        let maxConsumable = Math.min(count*rc.amount, this.state.consumedInputs[rc.category][rc.key].amount);
                        if ( maxConsumable >= rc.amount ) {
                            count = Math.min(count, maxConsumable/rc.amount);
                        }
                    }

                    return count;
                };

                const reduceConsumpedInputsBy = (count, reqs) => {
                    if (!reqs) return;

                    for (const rc of reqs) {
                        this.state.consumedInputs[rc.category][rc.key].amount -= count*rc.amount;
                    }
                };

                if ( this.state.count > 0 ) {
                    Object.keys(this.outputs).map((cat) => {
                        Object.keys(this.outputs[cat]).map((output) => {
                            rules = this.outputs[cat][output];
                            lastProcessed = rules.lastProcessed;
                            obj = this.engine[cat][output];

                            if (lastProcessed) {
                                if (obj) {
                                    if (rules.productionTime > 0 && dt - lastProcessed >= rules.productionTime) {
                                        if (inputRequirementsMet(rules.inputRequirements)) {
                                            // calculate the number of times this calculation "should" have executed since the last execution
                                            let timeMultiple = Math.trunc((dt-lastProcessed)/rules.productionTime);
                                            // clamp to the minimum possible consumable inputs
                                            let clampedCount = clampByConsumedInputs(this.state.count*timeMultiple, rules.inputRequirements);
                                            const incrementBy = clampedCount * rules.productionAmount;
        
                                            reduceConsumpedInputsBy(clampedCount, rules.inputRequirements);
                                            if (obj.incrementBy(incrementBy) != 0) {
                                                this.emit("PRODUCER_OUTPUT", {
                                                    producer: this,
                                                    output: obj,
                                                    delta: incrementBy
                                                });
                                            }
                        
                                            rules.lastProcessed = dt;
                                        }                                }
                                } else {
                                    throw `Output object not found:\n\tType: ${cat}\n\tKey: ${output}`
                                }
                            } else {
                                rules.lastProcessed = dt;
                            }
                        });
                    });
                }
            };

            const runPostProcessors = () => {
                if (this.postProcessors) {
                    Object.keys(this.postProcessors).forEach((pp) => {
                        const stack = this.postProcessors[pp].stack || null;
                        if (this.postProcessors[pp].func) {
                            this.postProcessors[pp].func(this, stack);
                        }
                    });
                }
            };

            if (this.state.processingEnabled) {
                processInputs();
                processOutputs();
                runPostProcessors();
            }
        }
    }

    class Resource extends Entity {
        constructor(opts) {
            super("resource", opts);
            this.state.basePrice = opts.basePrice;

            this.calculated = opts.calculated;
        }

        get basePrice() {
            return this.state.basePrice;
        }

        calculatePrice(amountToSell) {
            if (this.state.basePrice) {
                amountToSell = amountToSell || this.state.count;
                return { currency: this.state.basePrice.currency, amount: amountToSell * this.state.basePrice.amount };
            }
            return null;
        }

        processTick(dt) {
            if (this.calculated && typeof this.calculated === "object") {
                let obj;
                const source = this.calculated.source;
                
                switch (source.type) {
                    case "resource":
                        obj = this.engine.resources[source.key];
                        break;

                    case "producer":
                        obj = this.engine.producers[source.key];
                        break;

                    default:
                        break;
                }
                if (obj) {
                    this.state.count = this.calculated.calcFunc(obj);
                }
            }
        }
    }

    class Modifier {
        constructor(opts) {
            this.state = {
                key: opts.key
            };
            this.apply = opts.applyFunc;
            this.remove = opts.removeFunc;
        }
    }

    class Reactor extends EventEmitter {
        constructor(opts) {
            super();
            this.state = {
                key: opts.key,
                entityType: opts.entityType,
                entityKey: opts.entityKey,
                basePrice: opts.basePrice,
                count: opts.count || 0,
                maxCount: opts.maxCount || Number.MAX_VALUE
            };
            this.engine = opts.engine;

            // register the event handlers with the entity
            const entity = this.engine[opts.entityType](opts.entityKey);
            if (entity && opts.eventHandlers) {
                opts.eventHandlers.forEach((eh) => {
                    entity.on(eh.event, eh.handler.bind(this));
                });
            }
        }

        get key()               { return this.state.key }
        get entityType()        { return this.state.entityType }
        get entityKey()         { return this.state.entityKey }
        get basePrice()         { return this.state.basePrice }
        get count()             { return this.state.count }

        get entity() {
            if (!this.state.entityType || !this.state.entityKey)    throw `Invalid entity configuration in Reactor ${this.state.key}`;
            return this.engine[this.state.entityType+'s'][this.state.entityKey];
        }

        purchase() {
            if (!this.basePrice) return false;

            const currency = this.engine.currency(this.basePrice.currency);
            let result = false;

            if ( currency.value >= this.basePrice.amount ) {
                this.state.count += 1;
                currency.incrementBy(-this.basePrice.amount);
                result = true;
                this.emit("REACTOR_PURCHASED", this);
            }

            return result;
        }
    }

    const NUMBER_FORMATTERS = {
        "scientific": formatScientificNumber,
        "dictionary": formatDictionaryNumber,
        "abstract": formatAbstractNumber
    };

    class ContinuumEngine {
        constructor() {
            this.lastTick = 0;
            this.lastSave = 0;
            this.currencies = {};
            this.producers = {};
            this.resources = {};
            this.modifiers = {};
            this.reactors = {};
            this.activeModifiers = [];
            this.numberFormatter = formatDictionaryNumber;
            this.autosavePeriod = 0;
            console.log("%c %c Continuum Engine ready", "font-size: 12px;background: blue; color: white", "font-size: 12px; background: white; color: black;");
        }

        createCurrency(type, initialValue) {
            if ( !type ) throw `Invalid currency type value provided ${type}`;
            if (!this.currencies[type]) {
                this.currencies[type] = new Currency(type, initialValue);
            }
            return this.currencies[type];
        }

        currency(type) {
            return this.currencies[type];
        }

        createProducer(opts) {
            if ( !opts ) throw "No producer options provided";
            if ( !opts.key ) throw `Invalid producer .key value provided ${opts.type}`;
            if (!this.producers[opts.key]) {
                opts.engine = this;
                this.producers[opts.key] = new Producer(opts);
            }
            return this.producers[opts.key];
        }

        destroyProducer(key) {
            if (this.producers[key]) {
                delete this.producers[key];
            }
        }

        producer(key) {
            return this.producers[key];
        }

        createResource(opts) {
            if ( !opts ) throw "No resource options provided";
            if ( !opts.key ) throw `Invalid resource .key value provided ${opts.key}`;
            if (!this.resources[opts.key]) {
                opts.engine = this;
                this.resources[opts.key] = new Resource(opts);
            }
            return this.resources[opts.key];
        }

        resource(key) {
            return this.resources[key];
        }

        createModifier(opts) {
            if (!opts) throw "No modifier options provided";
            if (!opts.key) throw `Invalid modifier .key value provided ${opts.key}`;
            if (!this.modifiers[opts.key]) {
                opts.engine = this;
                this.modifiers[opts.key] = new Modifier(opts);
            }
            return this.modifiers[opts.key];
        }

        modifier(key) {
            return this.modifiers[key];
        }

        createReactor(opts) {
            if (!opts) throw "No reactor options provided";
            if (!opts.key) throw `Invalid reactor .key value provided ${opts.key}`;
            if (!this.reactors[opts.key]) {
                opts.engine = this;
                this.reactors[opts.key] = new Reactor(opts);
            }
            return this.reactors[opts.key];
        }

        reactor(key) {
            return this.reactors[key];
        }

        activateModifier(key, opts) {
            if (this.modifiers[key]) {
                if ( !this.modifiers[key].applyFunc ) return;
                const modifier = {
                    key: key,
                    expiresAt: opts.timeLeft ? Date.now() + opts.timeLeft : null,
                };
                // apply the modifier
                for (const producer in this.producers) {
                    this.modifiers[key].apply("producer", this.producers[producer]);
                }
                for (const resource in this.resources) {
                    this.modifiers[key].apply("resource", this.resources[resource]);
                }

                // store the modifier in the active modifiers array
                this.activeModifiers.push(modifier);
            } else {
                console.error(`Modifier ${key} not found and cannot be activated`);
            }
        }

        onTick(dt) {
            if (this.lastTick) {
                if (dt - this.lastTick > 50 ) {
                    this.processProducers(dt);
                    this.processResources(dt);
                    this.processModifiers(dt);
                    // store the last tick that we did processing on
                    this.lastTick = dt;
                }
            } else {
                this.lastTick = dt;
            }
            this.autoSave(dt);
        }

        autoSave(dt) {
            if (!this.autosavePeriod) return;

            if (this.lastSave) {
                if (dt - this.lastSave > this.autosavePeriod) {
                    this.saveState();
                    this.lastSave = dt;
                }
            } else {
                this.lastSave = dt;
            }
        }

        saveState() {
            const serialiseObject = (o) => {
                const result = {};
                for (const prop in o) {
                    result[prop] = o[prop].serialise();
                }
                return result;
            };

            const state = {
                lastTick: 0, //this.lastTick,
                lastSave: 0, //this.lastSave,
                currencies: serialiseObject(this.currencies),
                producers: serialiseObject(this.producers),
                resources: serialiseObject(this.resources),
                reactors: serialiseObject(this.reactors),
                numberFormatter: this.numberFormatter,
                autosavePeriod: this.autosavePeriod
            };
            window.localStorage.setItem('state', JSON.stringify(state));
        }

        loadState() {
            let state = window.localStorage.getItem('state');

            if (state) {
                try {
                    state = JSON.parse(state);
                    for (const prop in state) {
                        switch (prop) {
                            case "currencies":
                                for (const curr in state[prop]) {
                                    this.currencies[curr].deserialise(state[prop][curr]);
                                }
                                break;

                            case "resources":
                                for (const res in state[prop]) {
                                    this.resources[res].deserialise(state[prop][res]);
                                }
                                break;

                            case "producers":
                                for (const prod in state[prop]) {
                                    this.producers[prod].deserialise(state[prop][prod]);
                                }
                                break;

                            default:
                                this[prop] = state[prop];
                                break;
                        }
                    }
                } catch (e) {
                    throw e;
                }
            }
        }

        processProducers(dt) {
            let producer;
            for (const key in this.producers) {
                producer = this.producers[key];
                producer.onTick(dt);
            }
        }

        processResources(dt) {
            let resource;
            for (const key in this.resources) {
                resource = this.resources[key];
                resource.onTick(dt);
            }
        }

        processModifiers(dt) {
            let modifier;
            for ( let i = this.activeModifiers.length-1; i >= 0; i-- ) {
                modifier = this.activeModifiers[i];
                if (modifier.expiresAt < Date.now()) {
                    // deactivate the modifier
                    for (const producer in this.producers) {
                        this.modifiers[modifier.key].remove("producer", this.producers[producer]);
                    }
                    for (const resource in this.resources) {
                        this.modifiers[modifier.key].remove("resource", this.resources[resource]);
                    }
                    // remove the modifier from the active modifiers list
                    this.activeModifiers.splice(i, 1);
                }
            }
        }

        setNumberFormatter(type) {
            if (typeof type == "string") {
                if (!NUMBER_FORMATTERS[type]) throw `Unknown number formatter (${type}) requested`;
                this.numberFormatter = NUMBER_FORMATTERS[type];
            } else if (typeof type == "function") {
                this.numberFormatter = type;
            } else {
                throw "Unknown number type provided";
            }
        }

        formatNumber(n, decimals = 2) {
            return this.numberFormatter(n, decimals);
        }
    }

    return ContinuumEngine;

}());
