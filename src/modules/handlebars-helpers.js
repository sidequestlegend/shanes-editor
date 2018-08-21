import Handlebars from 'handlebars/dist/handlebars.min';
Handlebars.registerHelper('to-fixed', function(number, length) {
    number = Handlebars.Utils.escapeExpression(number);
    return new Handlebars.SafeString(parseFloat(number).toFixed(length));
});
Handlebars.registerHelper('number-format', function(number, separator) {
    number = Handlebars.Utils.escapeExpression(number);
    return new Handlebars.SafeString(number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator));
});
Handlebars.registerHelper('ternary', function(test, yes, no) {
    return test ? yes : no;
});
Handlebars.registerHelper('remove-spaces', function(string) {
    return string.split(' ').join('').toLowerCase();
});
Handlebars.registerHelper('upper-first', function(string) {
    return string.charAt(0).toUpperCase() + string.substr(1);
});
Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    let operator = options.hash.operator || "==";

    let operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    let result = operators[operator](lvalue,rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});