import app from "./src/app.js"
const PORT = process.env.PORT || 3090


app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})

