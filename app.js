// carregando módulos

const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require('passport')
require("./config/auth")(passport)

// dependendo de onde está sendo hospedado o banco - na mongoDB cloud ou na máquina local
const db = require("./config/db")

// Configurações

// sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    next()
})

// configuração do body parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// configuração do handlebars

app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

//mongoose
mongoose.Promise = global.Promise
mongoose.connect("mongodb+srv://evan:59u74oJTGR0hlIVQ@blogapp.inmyizl.mongodb.net/?retryWrites=true&w=majority").then(() => {
    console.log("conectado ao mongodb")
}).catch((err) => {
    console.log("Erro ao tentar conexão com o banco")
})

//comming soon

// Public - arquivos estáticos
app.use(express.static(path.join(__dirname, "public"))) //__dirname - caminho absoluto
app.use((req, res, next) => {
    next()
})


// Rotas
app.get('/', (req, res) => {
    Postagem.find().populate("categoria").sort({ data: "desc" }).lean().then((postagens) => {
        res.render("index", { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })
})

app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).lean().then((postagem) => {
        if (postagem) {
            res.render("postagem/index", { postagem: postagem })

        } else {
            req.flash("error_msg", "Esta postagem não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        console.log('deu um erro ' + err)
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })
})

app.get("/404", (req, res) => {
    res.send("Coletivo de anão")
})

app.use('/admin', admin) // prefixo /admin

app.get("/categorias", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("categorias/index", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao tentar listar as categorias")
    })
})

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        if (categoria) {
            Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {
                res.render("categorias/postagens", { postagens: postagens, categoria: categoria })
            }).catch((err) => {
                console.log("evan" + err)
                req.flash("error_msg", "Houve um erro ao listar os posts ")
                res.redirect("/")
            })
        } else {
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
    })
})

app.use("/usuarios", usuarios)


// Outros
const PORT = process.env.PORT || 8089
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})

