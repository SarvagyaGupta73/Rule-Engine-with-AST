const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Express setup with middleware
class Server {
    constructor(port) {
        this.app = express();
        this.port = port;
        this.setupMiddleware();
        this.connectDB();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(express.static('public'));
    }

    async connectDB() {
        try {
            await mongoose.connect('mongodb+srv://princegupta2373:U8ojRLrPWBGGGpYF@enginerule.wkidw.mongodb.net/', {
                useUnifiedTopology: true
            });
            console.log("Connected to MongoDB");
        } catch (err) {
            console.error("Error connecting to MongoDB:", err);
        }
    }

    setupRoutes() {
        this.app.use('/api/rules', new RuleController().router);
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server running on http://localhost:${this.port}`);
        });
    }
}

// Rule Schema
const RuleModel = mongoose.model('Rule', new mongoose.Schema({
    ruleName: { type: String, required: true, unique: true },
    ruleAST: { type: Object, required: true }
}));

// Rule Parser Class
class RuleParser {
    constructor() {
        this.precedence = {
            'AND': 2,
            'OR': 1
        };
    }

    tokenize(ruleString) {
        return ruleString.match(/(\(|\)|AND|OR|<=|>=|!=|<|>|=|[^()\s]+)/g);
    }

    isOperator(token) {
        return token === 'AND' || token === 'OR';
    }

    parseExpression(tokens) {
        const output = [];
        const operators = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i].trim();
            if (token === ' ') continue;

            if (this.isOperator(token)) {
                while (
                    operators.length && 
                    operators[operators.length - 1] !== '(' && 
                    this.precedence[operators[operators.length - 1]] >= this.precedence[token]
                ) {
                    this.createOperatorNode(output, operators.pop());
                }
                operators.push(token);
            } else if (token === '(') {
                operators.push(token);
            } else if (token === ')') {
                while (operators.length && operators[operators.length - 1] !== '(') {
                    this.createOperatorNode(output, operators.pop());
                }
                operators.pop();
            } else {
                this.createOperandNode(tokens, output, i);
                i += 2; // Skip operator and value
            }
        }

        while (operators.length) {
            this.createOperatorNode(output, operators.pop());
        }

        return output[0];
    }

    createOperandNode(tokens, output, index) {
        output.push({
            type: 'operand',
            key: tokens[index],
            operator: tokens[index + 1],
            value: tokens[index + 2]
        });
    }

    createOperatorNode(output, operator) {
        const right = output.pop();
        const left = output.pop();
        output.push({
            type: 'operator',
            operator,
            left,
            right
        });
    }

    parse(ruleString) {
        const tokens = this.tokenize(ruleString);
        return this.parseExpression(tokens);
    }
}

// Rule Evaluator Class
class RuleEvaluator {
    evaluate(node, data) {
        if (!node) return false;

        if (node.type === 'operator') {
            return this.evaluateOperator(node, data);
        }
        return this.evaluateOperand(node, data);
    }

    evaluateOperator(node, data) {
        const leftResult = this.evaluate(node.left, data);
        const rightResult = this.evaluate(node.right, data);
        
        const operations = {
            'AND': () => leftResult && rightResult,
            'OR': () => leftResult || rightResult
        };

        return operations[node.operator]();
    }

    evaluateOperand(node, data) {
        let { key, operator, value } = node;
        
        if (typeof value === 'string' && value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
        }

        const operations = {
            '>': (a, b) => a > b,
            '<': (a, b) => a < b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
            '==': (a, b) => a == b,
            '!=': (a, b) => a != b,
            '=': (a, b) => a == b
        };

        return operations[operator]?.(data[key], value) ?? false;
    }
}

// Rule Controller Class
class RuleController {
    constructor() {
        this.router = express.Router();
        this.parser = new RuleParser();
        this.evaluator = new RuleEvaluator();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.post('/create_rule', this.createRule.bind(this));
        this.router.post('/combine_rules', this.combineRules.bind(this));
        this.router.post('/evaluate_rule', this.evaluateRule.bind(this));
    }

    async createRule(req, res) {
        try {
            const { ruleName, ruleString } = req.body;
            if (!ruleName || !ruleString) {
                return res.status(400).json({ error: 'ruleName and ruleString are required' });
            }

            const ruleAST = this.parser.parse(ruleString);
            const rule = new RuleModel({ ruleName, ruleAST });
            await rule.save();
            
            res.status(201).json(rule);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async combineRules(req, res) {
        try {
            const { rules, op } = req.body;
            const ruleDocs = await RuleModel.find({ ruleName: { $in: rules } });
            
            if (!ruleDocs.length) {
                return res.status(404).json({ error: 'No matching rules found' });
            }

            const combinedAST = this.combineRuleNodes(ruleDocs.map(r => r.ruleAST), op);
            const randomName = this.generateRandomName();
            const newRule = new RuleModel({
                ruleName: `combined${randomName}`,
                ruleAST: combinedAST
            });

            await newRule.save();
            res.status(201).json(newRule);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async evaluateRule(req, res) {
        try {
            const { ast, data } = req.body;
            const rule = await RuleModel.findOne({ ruleName: ast });
            
            if (!rule) {
                return res.status(404).json({ error: 'Rule not found' });
            }

            const result = this.evaluator.evaluate(rule.ruleAST, data);
            res.status(200).json({ result });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    combineRuleNodes(nodes, operator) {
        return nodes.reduce((acc, node) => ({
            type: 'operator',
            operator,
            left: acc,
            right: node
        }));
    }

    generateRandomName(length = 4) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
}

// Start the server
new Server(3000).start();