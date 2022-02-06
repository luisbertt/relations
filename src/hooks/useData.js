import { useState, useEffect } from "react"
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
