let path    = process.argv[2];
let esprima = require('esprima');
let fs      = require('fs');
let code    = fs.readFileSync(path, 'utf8');
let tree    = esprima.parse(code);

function flatten(node, curr) {
    for (let key in node) {
        if (node.hasOwnProperty(key)) {
            let child = node[key];
            if (typeof child === 'object' && child !== null) {
                if (Array.isArray(child)) {
                    node[key] = child.map(i => flatten(i, node));
                } else {
                    node[key] = flatten(child, node);
                }
            }
        }
    }

    if (node.type === "ArrayExpression") {
        if (node.elements.find(i => i.type === "SequenceExpression")) {
            let elements = [];
            let sequence = [];
            node.elements.forEach(i => {
                if (i.type === "SequenceExpression") {
                    elements.push(i.expressions.pop());
                    sequence = sequence.concat(i.expressions);
                } else {
                    elements.push(i);
                }
            });
            node.elements = elements;
            let next = {
                type: "SequenceExpression",
                expressions: sequence.concat(node)
            };
            return next;
        }
    }
    else if ((node.type === "AssignmentExpression") || (node.type === "BinaryExpression")) {
        let expressions = [];
        if (node.left.type === "SequenceExpression") {
            let sequence = node.left.expressions;
            node.left = sequence.pop();
            expressions = expressions.concat(sequence);
        }
        if (node.right.type === "SequenceExpression") {
            let sequence = node.right.expressions;
            node.right = sequence.pop();
            expressions = expressions.concat(sequence);
        }
        if (expressions.length) {
            let next = {
                type: "SequenceExpression",
                expressions: expressions.concat(node)
            };
            return next;
        }
    }
    else if (node.type === "BlockStatement" || node.type === "Program") {
        let body = [];
        node.body.forEach(i => {
            if (i.type === "BlockStatement") {
                body = body.concat(i.body);
            } else {
                body.push(i);
            }
        });
        node.body = body;
    }
    else if (node.type === "CallExpression" || node.type === "NewExpression") {
        let args = node.arguments.find(i => i.type === "SequenceExpression");
        if (node.callee.type === "SequenceExpression" && args) {
            let sequence = node.callee.expressions;
            node.callee = sequence.pop()
            let elements = [];
            node.arguments.forEach(i => {
                if (i.type === "SequenceExpression") {
                    elements.push(i.expressions.pop());
                    sequence = sequence.concat(i.expressions);
                } else {
                    elements.push(i);
                }
            });
            node.arguments = elements;
            let next = {
                type: "SequenceExpression",
                expressions: sequence.concat(node)
            };
            return next;
        }
        if (node.callee.type === "SequenceExpression") {
            let sequence = node.callee.expressions;
            node.callee = sequence.pop()
            let next = {
                type: "SequenceExpression",
                expressions: sequence.concat(node)
            };
            return next;
        } 
        if (args) {
            let elements = [];
            let sequence = [];
            node.arguments.forEach(i => {
                if (i.type === "SequenceExpression") {
                    elements.push(i.expressions.pop());
                    sequence = sequence.concat(i.expressions);
                } else {
                    elements.push(i);
                }
            });
            node.arguments = elements;
            let next = {
                type: "SequenceExpression",
                expressions: sequence.concat(node)
            };
            return next;
        }
    }
    else if (node.type === "ConditionalExpression") {
        if (node.test.type === "SequenceExpression") {
            let sequence = node.test.expressions;
            node.test = sequence.pop();
            let next = {
                type: "SequenceExpression",
                expressions: sequence.concat(node)
            };
            return next;
        }
    }
    else if (node.type === "ExpressionStatement") {
        if (node.expression.type === "SequenceExpression") {
            let body = node.expression.expressions.map(i => ({
                type: "ExpressionStatement",
                expression: i
            }));
            let next = {
                type: "BlockStatement",
                body: body
            };
            return next;
        }
        if (node.expression.type === "VariableDeclaration") {
            let body = node.expression.declarations.map(i => ({
                type: "VariableDeclaration",
                declaration: i
            }));
            let next = {
                type: "BlockStatement",
                body: body
            };
            return next;
        }
    }
    else if (node.type === "ForInStatement") {
        if (node.right && node.right.type === "SequenceExpression") {
            let sequence = node.right.expressions;
            node.right = sequence.pop();
            let body = sequence.map(i => ({
                type: "ExpressionStatement",
                expression: i
            }));
            let next = {
                type: "BlockStatement",
                body: body.concat(node)
            };
            return next;
        }
        if (node.right && node.right.type === "BlockStatement") {
            let sequence = node.right.body;
            node.right = sequence.pop();
            let next = {
                type: "BlockStatement",
                body: sequence.concat(node)
            };
            return next;
        }
    }
    else if (node.type === "ForStatement") {
        if (node.init && node.init.type === "SequenceExpression") {
            let sequence = node.init.expressions;
            node.init = sequence.pop();
            let body = sequence.map(i => ({
                type: "ExpressionStatement",
                expression: i
            }));
            let next = {
                type: "BlockStatement",
                body: body.concat(node)
            };
            return next;
        }
        if (node.init && node.init.type === "BlockStatement") {
            let sequence = node.init.body;
            node.init = sequence.pop();
            let next = {
                type: "BlockStatement",
                body: sequence.concat(node)
            };
            return next;
        }
    }
    else if (node.type === "IfStatement") {
        if (node.test && node.test.type === "SequenceExpression") {
            let sequence = node.test.expressions;
            node.test = sequence.pop();
            let body = sequence.map(i => ({
                type: "ExpressionStatement",
                expression: i
            }));
            let next = {
                type: "BlockStatement",
                body: body.concat(node)
            };
            return next;
        }
    }
    else if (node.type === "LogicalExpression") {
        if (node.left.type === "SequenceExpression") {
            let sequence = node.left.expressions;
            node.left = sequence.pop()
            let next = {
                type: "SequenceExpression",
                expressions: sequence.concat(node)
            };
            return next;
        }
    }
    else if (node.type === "MemberExpression") {
        let expressions = [];
        if (node.object.type === "SequenceExpression") {
            let sequence = node.object.expressions;
            node.object = sequence.pop();
            expressions = expressions.concat(sequence);
        }
        if (node.property.type === "SequenceExpression") {
            let sequence = node.property.expressions;
            node.property = sequence.pop();
            expressions = expressions.concat(sequence);
        }
        if (expressions.length) {
            let next = {
                type: "SequenceExpression",
                expressions: expressions.concat(node)
            };
            return next;
        }
    }
    else if (node.type === "ReturnStatement") {
        if (node.argument && node.argument.type === "SequenceExpression") {
            let sequence = node.argument.expressions;
            node.argument = sequence.pop();
            let body = sequence.map(i => ({
                type: "ExpressionStatement",
                expression: i
            }));
            let next = {
                type: "BlockStatement",
                body: body.concat(node)
            };
            return next;
        }
    }
    else if (node.type === "SequenceExpression") {
        let expressions = [];
        node.expressions.forEach(i => {
            if (i.type === "SequenceExpression")
                expressions = expressions.concat(i.expressions);
            else
                expressions.push(i);
        });
        node.expressions = expressions;
    }
    else if (node.type === "SwitchStatement") {
        if (node.discriminant && node.discriminant.type === "SequenceExpression") {
            let sequence = node.discriminant.expressions;
            node.discriminant = sequence.pop();
            let body = sequence.map(i => ({
                type: "ExpressionStatement",
                expression: i
            }));
            let next = {
                type: "BlockStatement",
                body: body.concat(node)
            };
            return next;
        }
    }
    else if (node.type === "UnaryExpression") {
        if (node.argument.type === "SequenceExpression") {
            let sequence = node.argument.expressions;
            node.argument = sequence.pop()
            let next = {
                type: "SequenceExpression",
                expressions: sequence.concat(node)
            };
            return next;
        }
    }
    else if (node.type === "VariableDeclaration") {
        let body = [];
        node.declarations.forEach(i => {
            if (i.init && i.init.type === "SequenceExpression") {
                    let sequence = i.init.expressions;
                    i.init = sequence.pop();
                    let stmt = sequence.map(j => ({
                        type: "ExpressionStatement",
                        expression: j
                    }));
                    body = body.concat(stmt);
                    body.push({
                        kind: node.kind,
                        type: node.type,
                        declarations: [i]
                });
            } else {
                body.push({
                    kind: node.kind,
                    type: node.type,
                    declarations: [i]
                });
            }
        });
        if (body.length > 1) {
            let next = {
                type: "BlockStatement",
                body: body
            };
            return next;
        }
    }

    return node;
};

tree = flatten(tree, "", tree);
console.log(JSON.stringify(tree, null, 2));
