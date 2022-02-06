/*
 * split csv row into an array
 * "example,one,two" -> ['example','one','two']
 */
export function csvRowToArray(text) {
    var re_valid =
        /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/
    var re_value =
        /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g

    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null

    var a = [] // Initialize array to receive values.
    text.replace(
        re_value, // "Walk" the string using replace with callback.
        function (_, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"))
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'))
            else if (m3 !== undefined) a.push(m3)
            return "" // Return empty string.
        }
    )

    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push("")
    return a
}

/*
 * group data by card number
 */
export function groupData(data) {
    // split data into array of csv rows and delete first 5 header rows
    const table = data.trim().split("\r\n").splice(5)
    // pass each row to the csvRowToArray function
    const list = table.map(row => csvRowToArray(row))

    // get unique set of card numbers
    const cardNumbers = [...new Set(list.map(row => row[1]))]

    // return grouped transactions by card number
    return cardNumbers.map(num => {
        const trans = list.filter(row => row[1] === num)
        return {
            cardholder: trans[0][0],
            cardNumber: num,
            total: trans
                .map(t => Number(t[6]))
                .reduce((prev, curr) => prev + curr, 0),
            transactions: trans.map(tran => ({
                postDate: tran[2],
                transDate: tran[3],
                refId: tran[4],
                description: tran[5],
                amount: tran[6],
                mcc: tran[7],
                merchCat: tran[8],
                type: "Expenses",
            })),
        }
    })
}

export const categories = [
    "Expenses",
    "Repaint",
    "Restaurants",
    "Gas",
    "Payment",
    "Unknown",
]

export const categoryColorMap = {
    Expenses: "bg-pink-200",
    Repaint: "bg-yellow-200",
    Restaurants: "bg-blue-200",
    Gas: "bg-purple-200",
    Unknown: "bg-red-200",
    Default: "bg-white",
}
