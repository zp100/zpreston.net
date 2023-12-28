// Tokenizes a tags string.
function tokenize_tags(tags) {
    // Create a list of regex rules to test for tokens.
    const regex_set = {
        'ws': /\s+/,
        'tag': /[^,|~()]*[^,|~()\s]/,   // excludes filter symbols ,|~() and can't end with ws
        'and': ',',                     // separator
    }

    // Create a token list from the tags.
    const token_list = tokenize(tags, regex_set)

    // Remove commas from the list.
    const token_list_no_commas = []
    for (const token of token_list) {
        // Check if it's not a comma.
        if (token !== ',') {
            // Add the token.
            token_list_no_commas.push(token)
        }
    }

    // Return the token list.
    return token_list_no_commas
}



// Tokenizes a filters string.
function tokenize_filters(filters) {
    // Create a list of regex rules to test for tokens.
    const regex_set = {
        'ws': /\s+/,
        'tag': /[^,|~()]*[^,|~()\s]/,   // excludes filter symbols ,|~() and can't end with ws
        'and': ',',                     // separator
        'or': /\|/,
        'not': /~/,
        'open_paren': /\(/,
        'close_paren': /\)/,
    }

    // Create a token list from the filters.
    const token_list = tokenize(filters, regex_set)

    // Return the token list.
    return token_list
}



// Converts a string into a list of tokens using the given set of regex rules.
// If a rule is named 'ws' then any of its tokens are not included in the list.
function tokenize(string, regex_set) {
    // Parse until the full string has been consumed.
    const token_list = []
    while (string.length > 0) {
        // Loop through the regex strings to test if any match.
        let is_match_found = false
        for (const key in regex_set) {
            // Check for match at the start of the string.
            const m = string.match(regex_set[key])
            if (m !== null && m.index === 0) {
                // Check which token was added.
                if (key !== 'ws') {
                    // Add the token.
                    token_list.push(m[0])
                }

                // Remove the token from the string.
                string = string.replace(m[0], '')

                // Stop searching.
                is_match_found = true
                break
            }
        }

        // Check if no match was found.
        if (!is_match_found) {
            // Syntax error.
            return null
        }
    }

    // Return the finished token list.
    return token_list
}



// Parses a list of tokens into a syntax tree.
function parse_token_list(token_list) {
    // Recursively parse.
    const ret = parse_or_exp(token_list)

    // Check if errors occured or the whole token list hasn't been used.
    if (ret === null || ret.token_list.length > 0) {
        // Syntax error.
        return null
    }

    // Return the syntax tree.
    return ret.node
}



// Parse tokens as "or" expression.
function parse_or_exp(token_list) {
    // Check if there are no tokens left.
    if (token_list.length === 0) {
        // Syntax error.
        return null
    }

    // Parse for "and" expression.
    const ret1 = parse_and_exp(token_list)
    if (ret1 === null) {
        // Syntax error.
        return null
    }

    // Copy values from return.
    token_list = ret1.token_list
    const node1 = ret1.node

    // Check for end of grammar rule.
    if (token_list.length === 0 || token_list[0] !== '|') {
        // Return the node.
        return {
            'token_list': token_list,
            'node': node1,
        }
    }

    // Consume 'or' operator.
    token_list.shift()

    // Parse for "or" expression.
    const ret2 = parse_or_exp(token_list)
    if (ret2 === null) {
        // Syntax error.
        return null
    }

    // Copy values from return.
    token_list = ret2.token_list
    const node2 = ret2.node

    // Return the results.
    return {
        'token_list': token_list,
        'node': {
            'op': 'or',
            'left': node1,
            'right': node2,
        },
    }
}



// Parse tokens as "and" expression.
function parse_and_exp(token_list) {
    // Check if there are no tokens left.
    if (token_list.length === 0) {
        // Syntax error.
        return null
    }

    // Parse for "not" expression.
    const ret1 = parse_not_exp(token_list)
    if (ret1 === null) {
        // Syntax error.
        return null
    }

    // Copy values from return.
    token_list = ret1.token_list
    const node1 = ret1.node

    // Check for end of grammar rule.
    if (token_list.length === 0 || token_list[0] !== ',') {
        // Return the node.
        return {
            'token_list': token_list,
            'node': node1,
        }
    }

    // Consume 'and' operator.
    token_list.shift()

    // Parse for "and" expression.
    const ret2 = parse_and_exp(token_list)
    if (ret2 === null) {
        // Syntax error.
        return null
    }

    // Copy values from return.
    token_list = ret2.token_list
    const node2 = ret2.node

    // Return the results.
    return {
        'token_list': token_list,
        'node': {
            'op': 'and',
            'left': node1,
            'right': node2,
        },
    }
}



// Parse tokens as "not" expression.
function parse_not_exp(token_list) {
    // Check if there are no tokens left.
    if (token_list.length === 0) {
        // Syntax error.
        return null
    }

    // Check which token is next.
    if (token_list[0] === '~') {
        // Consume 'not' operator.
        token_list.shift()

        // Parse for "not" expression.
        const ret = parse_not_exp(token_list)
        if (ret === null) {
            // Syntax error.
            return null
        }

        // Copy values from return.
        token_list = ret.token_list
        const node1 = ret.node

        // Return the results.
        return {
            'token_list': token_list,
            'node': {
                'op': 'not',
                'unary': node1,
            },
        }
    } else if (token_list[0] === '(') {
        // Consume open parenthesis.
        token_list.shift()

        // Parse for "or" expression.
        const ret = parse_or_exp(token_list)
        if (ret === null) {
            // Syntax error.
            return null
        }

        // Copy values from return.
        token_list = ret.token_list
        const node1 = ret.node

        // Check if there's no close parenthesis.
        if (token_list.length === 0 || token_list[0] !== ')') {
            // Syntax error.
            return null
        }

        // Consume close parenthesis.
        token_list.shift()

        // Return the node.
        return {
            'token_list': token_list,
            'node': node1,
        }
    } else {
        // Store the tag into a node.
        const node1 = token_list[0]

        // Consume tag.
        token_list.shift()

        // Return the node.
        return {
            'token_list': token_list,
            'node': node1,
        }
    }
}
