import { useEffect, useRef, useState } from "react"
import { useReactToPrint } from "react-to-print"

function CSVtoArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g

    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null

    var a = [] // Initialize array to receive values.
    text.replace(
        re_value, // "Walk" the string using replace with callback.
        function (m0, m1, m2, m3) {
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

function transformData(data) {
    const table = data.split("\r\n").splice(5)
    const list = table.map((row) => CSVtoArray(row))

    const cardholders = [
        ...new Set(list.filter((row) => row[9] === "D").map((row) => row[0])),
    ]
    const cardnumbers = [
        ...new Set(list.filter((row) => row[9] === "D").map((row) => row[1])),
    ]

    const curatedList = list
        .filter((row) => row[9] !== "C")
        .map((row) => row.slice(1, 9))

    const groupedData = cardnumbers.map((num, i) => {
        const trans = curatedList
            .filter((row) => row[0] === num)
            .map((tran) => tran.slice(1))
        return {
            cardholder: cardholders[i],
            cardNumber: num,
            transactions: trans.map((tran) => ({
                postDate: tran[0],
                transDate: tran[1],
                refId: tran[2],
                description: tran[3],
                amount: tran[4],
                mcc: tran[5],
                merchCat: tran[6],
                type: "Expenses",
            })),
        }
    })

    return groupedData
}

const useData = () => {
    const [data, setData] = useState()
    const [selectedFile, setSelectedFile] = useState(null)

    useEffect(() => {
        function getData() {
            selectedFile.text().then((data) => setData(transformData(data)))
        }
        if (selectedFile) getData()
    }, [selectedFile])

    const handleTypeChange = (type, cardholder, rowIndex) => {
        const newTrans = data
            .filter((rel) => rel.cardholder === cardholder)[0]
            .transactions?.map((t, i) => (i !== rowIndex ? t : { ...t, type }))

        setData((data) =>
            data.map((rel) => {
                if (rel.cardholder !== cardholder) return rel
                return { ...rel, transactions: newTrans }
            })
        )
    }

    return { data, handleTypeChange, setSelectedFile }
}

const App = () => {
    const { data, handleTypeChange, setSelectedFile } = useData()
    const printRef = useRef()
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    })

    const relationsTransactions = data
        ? data.map((rel) => rel.transactions)
        : []
    const grandTotal = data
        ? data
              .map((rel) => rel.transactions)
              .map((rel) =>
                  rel.map((t) => Number(t.amount)).reduce((a, b) => a + b)
              )
              .reduce((a, b) => a + b, 0)
              .toFixed(2)
        : 0

    const types = ["Expenses", "Repaint", "Restaurants", "Gas", "Unknown"]

    const groupedAmountsByTypes = types.map((type, i) =>
        relationsTransactions
            .flat()
            .filter((t) => t.type === type)
            .map((t) => Number(t.amount))
            .reduce((a, b) => a + b, 0)
            .toFixed(2)
    )

    const groupToDivide = groupedAmountsByTypes
        .filter((t, i) => i !== 1)
        .map((t) => Number(t))
        .reduce((a, b) => a + b, 0)
        .toFixed(2)

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0])
    }

    return (
        <div className="container mx-auto">
            <div className="flex justify-between">
                <input type="file" onChange={handleFileChange} />
                <button className="p-1 border rounded" onClick={handlePrint}>
                    Print
                </button>
            </div>
            <div ref={printRef}>
                {data ? (
                    <Relations
                        relations={data}
                        handleTypeChange={handleTypeChange}
                    />
                ) : null}
                <div className="text-xl text-right font-bold">
                    Grand Total: {grandTotal}
                </div>
                <div className="flex space-x-10">
                    <div className="w-60 border border-black">
                        <p className="bg-pink-300 flex justify-between border border-black">
                            Expenses: <span>${groupedAmountsByTypes[0]}</span>
                        </p>
                        <p className="bg-yellow-300 flex justify-between border border-black">
                            Repaint: <span>${groupedAmountsByTypes[1]}</span>
                        </p>
                        <p className="bg-blue-200 flex justify-between border border-black">
                            Restaurants:{" "}
                            <span>${groupedAmountsByTypes[2]}</span>
                        </p>
                        <p className="bg-purple-300 flex justify-between border border-black">
                            Gas: <span>${groupedAmountsByTypes[3]}</span>
                        </p>
                        <p className="bg-red-200 flex justify-between border border-black">
                            Unknown: <span>${groupedAmountsByTypes[2]}</span>
                        </p>
                    </div>
                    <div>
                        <p>
                            Saldo A Pagar por Repaint:{" "}
                            <span>${groupedAmountsByTypes[1]}</span>
                        </p>
                        <p>
                            Saldo Entre las Cuentas Restantes:{" "}
                            <span>${groupToDivide}</span>
                        </p>
                        <p>
                            Each Account Paid (Taylor/Stock/MG){" "}
                            <span>${(groupToDivide / 3).toFixed(2)}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Relations = ({ relations, handleTypeChange }) => {
    return (
        <div className="border-2">
            <h1 className="font-bold text-center bg-blue-200">
                CASHREWARDS (008)
            </h1>
            <div className="space-y-5">
                {relations
                    ? relations.map((rel) => {
                          return (
                              <CardholderTrans
                                  cardholder={rel.cardholder}
                                  cardNumber={rel.cardNumber}
                                  trans={rel.transactions}
                                  key={Math.random() * 100}
                                  handleTypeChange={handleTypeChange}
                              />
                          )
                      })
                    : null}
            </div>
        </div>
    )
}

const CardholderTrans = ({
    trans,
    cardholder,
    cardNumber,
    handleTypeChange,
}) => {
    const total = trans
        ? trans
              .map((t) => Number(t.amount))
              .reduce((a, b) => a + b, 0)
              .toFixed(2)
        : 0

    function getColorByType(type) {
        switch (type) {
            case "Expenses":
                return "pink-300"
            case "Repaint":
                return "yellow-300"
            case "Restaurants":
                return "blue-200"
            case "Gas":
                return "purple-300"
            case "Unknown":
                return "red-200"
            default:
                return "white"
        }
    }

    return (
        <div>
            <h1 className="text-center font-bold bg-pink-100">
                {cardholder} - (...{cardNumber})
            </h1>
            <table className="w-full text-sm">
                <thead className="bg-pink-100 font-bold">
                    <tr>
                        <td>Posting Date</td>
                        <td>Trans. Date</td>
                        <td>Reference ID</td>
                        <td>Description</td>
                        <td>Amount</td>
                        <td>MCC</td>
                        <td>Merchant Category</td>
                        <td>Type</td>
                    </tr>
                </thead>
                <tbody>
                    {trans
                        ? trans.map((transaction, i) => (
                              <tr
                                  key={Math.random() * 1000}
                                  className={`bg-${getColorByType(
                                      transaction.type
                                  )}`}
                              >
                                  {Object.keys(transaction).map((key) =>
                                      key !== "type" ? (
                                          <td
                                              key={Math.random() * 1000}
                                              className="truncate"
                                          >
                                              {transaction[key]}
                                          </td>
                                      ) : null
                                  )}
                                  <td>
                                      <select
                                          value={transaction.type}
                                          onChange={(e) =>
                                              handleTypeChange(
                                                  e.target.value,
                                                  cardholder,
                                                  i
                                              )
                                          }
                                      >
                                          <option value="Expenses">
                                              Expenses
                                          </option>
                                          <option value="Repaint">
                                              Repaint
                                          </option>
                                          <option value="Gas">Gas</option>
                                          <option value="Restaurants">
                                              Restaurants
                                          </option>
                                          <option value="Unknown">
                                              Unknown
                                          </option>
                                      </select>
                                  </td>
                              </tr>
                          ))
                        : null}
                </tbody>
            </table>
            <p className="font-bold text-right">Total: ${total}</p>
        </div>
    )
}

export default App
