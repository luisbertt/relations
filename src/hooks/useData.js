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

    const handleTypeChange = (type, cardholder, rowIndex) => {
        const newTrans = data
            .filter(rel => rel.cardholder === cardholder)[0]
            .transactions?.map((t, i) => (i !== rowIndex ? t : { ...t, type }))

        setData(data =>
            data.map(rel => {
                if (rel.cardholder !== cardholder) return rel
                return { ...rel, transactions: newTrans }
            })
        )
    }

    return { data, handleTypeChange, setSelectedFile }
}
