import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { useData } from "./hooks/useData"

const App = () => {
    const { data, handleTypeChange, setSelectedFile } = useData()
    const printRef = useRef()
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    })

    const relationsTransactions = data ? data.map(rel => rel.transactions) : []
    const grandTotal = data
        ? data
              .map(rel => rel.transactions)
              .map(rel =>
                  rel.map(t => Number(t.amount)).reduce((a, b) => a + b)
              )
              .reduce((a, b) => a + b, 0)
              .toFixed(2)
        : 0

    const groupedAmountsByTypes = categories.map(type =>
        relationsTransactions
            .flat()
            .filter(t => t.type === type)
            .map(t => Number(t.amount))
            .reduce((a, b) => a + b, 0)
            .toFixed(2)
    )

    const groupToDivide = groupedAmountsByTypes
        .filter((_, i) => i !== 1)
        .map(t => Number(t))
        .reduce((a, b) => a + b, 0)
        .toFixed(2)

    const handleFileChange = e => {
        setSelectedFile(e.target.files[0])
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between">
                <input type="file" onChange={handleFileChange} />
                <button className="p-1 border rounded" onClick={handlePrint}>
                    Print
                </button>
            </div>
            <div ref={printRef}>
                {data ? (
                    <>
                        <Relations
                            relations={data}
                            handleTypeChange={handleTypeChange}
                        />
                        <div className="text-xl text-right font-bold p-2 text-2xl">
                            Grand Total: {grandTotal}
                        </div>
                        <div className="flex space-x-10">
                            <div className="w-60">
                                {categories.map((c, i) => {
                                    return (
                                        <p
                                            className={categoryColorMap[c]}
                                            style={{
                                                justifyContent: "space-between",
                                                display: "flex",
                                                padding: ".5rem 1rem",
                                            }}
                                        >
                                            {c}:
                                            <span>
                                                ${groupedAmountsByTypes[i]}
                                            </span>
                                        </p>
                                    )
                                })}
                            </div>
                            <div>
                                <p>
                                    Repaint:{" "}
                                    <span>${groupedAmountsByTypes[1]}</span>
                                </p>
                                <p>
                                    Rest: <span>${groupToDivide}</span>
                                </p>
                                <p>
                                    Divide by accounts{" "}
                                    <span>
                                        ${(groupToDivide / 3).toFixed(2)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    )
}

const Relations = ({ relations, handleTypeChange }) => {
    return (
        <>
            <h1 className="font-bold text-center bg-blue-100">
                CASHREWARDS (008)
            </h1>
            <div className="space-y-5">
                {relations.map(rel => (
                    <CardholderTrans
                        cardholder={rel.cardholder}
                        cardNumber={rel.cardNumber}
                        trans={rel.transactions}
                        key={Math.random() * 100}
                        handleTypeChange={handleTypeChange}
                    />
                ))}
            </div>
        </>
    )
}

const categories = [
    "Expenses",
    "Repaint",
    "Restaurants",
    "Gas",
    "Payment",
    "Unknown",
]

const categoryColorMap = {
    Expenses: "bg-pink-200",
    Repaint: "bg-yellow-200",
    Restaurants: "bg-blue-200",
    Gas: "bg-purple-200",
    Unknown: "bg-red-200",
    Default: "bg-white",
}

const CardholderTrans = ({
    trans,
    cardholder,
    cardNumber,
    handleTypeChange,
}) => {
    const total = trans
        .map(t => Number(t.amount))
        .reduce((a, b) => a + b, 0)
        .toFixed(2)

    return (
        <div className="bg-gray-100">
            <h1 className="text-center font-bold px-2 py-1">
                {cardholder} - (...{cardNumber})
            </h1>
            <table className="w-full text-sm">
                <thead className="font-bold">
                    <tr>
                        <td>Posting Date</td>
                        <td>Trans. Date</td>
                        <td>Reference ID</td>
                        <td>Description</td>
                        <td>Amount</td>
                        <td>Merchant Category</td>
                        <td>Type</td>
                    </tr>
                </thead>
                <tbody>
                    {trans.map((transaction, i) => {
                        return (
                            <tr
                                key={Math.random() * 1000}
                                className={categoryColorMap[transaction.type]}
                            >
                                {Object.keys(transaction).map(key => {
                                    if (key === "type" || key === "mcc")
                                        return null
                                    const td = (
                                        <td key={Math.random() * 1000}>
                                            {transaction[key]}
                                        </td>
                                    )
                                    return td
                                })}
                                <td>
                                    <select
                                        value={transaction.type}
                                        onChange={e =>
                                            handleTypeChange(
                                                e.target.value,
                                                cardholder,
                                                i
                                            )
                                        }
                                        className="h-6 bg-transparent"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <p className="font-bold text-right text-xl px-2 py-1">
                Total: ${total}
            </p>
        </div>
    )
}

export default App
