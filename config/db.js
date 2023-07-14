if (process.env.NODE_ENV == "production") {
    module.exports = {mongoURI: "mongodb+srv://evan:59u74oJTGR0hlIVQ@blogapp.inmyizl.mongodb.net/?retryWrites=true&w=majority"}
}else{
    // pra rodar no docker - 172.17.0.2:27017 - dependendo da conexão
    module.exports = {mongoURI: "mongodb://172.17.0.2:27017/blogapp"}

    // caso esteja rodando na localhost comentar a linha acima e descomentar esta
    // module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}