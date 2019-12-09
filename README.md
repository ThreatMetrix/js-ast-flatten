# js-ast-flatten
Analysing and debugging Javascript for research purposes can often be a difficult and time consuming process.
This is often due to obfuscation teqhniques, name mangling and compilation using tools such as Google's Closure compiler.
There are also times when the Javascript statements and expressions are interleaved to form very complex structures.
This could be achieved by an intentional coding strategy, or more likely, from an automated tool.

To understand the order and scope of the expressions and statements, it is easier to parse the code into its AST (abstract syntax tree).
A description of the nodes in ECMAScript abstract trees cound be found here: https://esprima.readthedocs.io/en/latest/syntax-tree-format.html
Our approach to simplify this code is to minimize the depth of the AST.
This is achieved by reordering nodes and expanding out complex expressions.

# Requirements
esprima: ECMAScript parser for lexical and syntactic analysis
npm install esprima

# Usage
To use the tool, run with your input Javascript file as an argument.
This will read the input javascript file, parse, flatten and output the AST.
To then turn the output AST into javascript, pipe to astring or something similar.
eg. node flatten.js &ltinput.js&gt
