import { useState, useEffect } from "react"
import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { groupData } from "../utils"

export const useData = () => {
    const [data, setData] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)

    useEffect(() => {
        function getData() {
            selectedFile.text().then(data => setData(groupData(data)))
        }
        if (selectedFile) getData()
    }, [selectedFile])

    const handleTypeChange = (type, refId) => {
        const newTrans = data.map(g => {
            const transactions = g.transactions?.map(t => {
                if (t.refId === refId) return { ...t, type }
                return t
            })
            return { ...g, transactions }
        })
        setData(newTrans)
    }

    return { data, handleTypeChange, setSelectedFile }
}

export const usePrint = () => {
    const printRef = useRef()
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    })

    return { printRef, handlePrint }
}
