/*
Arquivo: server.js
Data: 08/07/2018
Observação: Arquivo principal e responsável por executar a nossa aplicação.
Author: Valdir Torres
*/

// Aqui estamos usando os pacotes instalados para o arquivo:
var express     = require('express');
var app         = express();

var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt     = require('jsonwebtoken'); //pacote usado para criar e verificar os tokens
var config  = require('./config'); //aqui estamos retornando a configuração criada nesse arquivo relacionado ao bd
var Usuario = require('./app/models/usuario'); //estamos retornando a classe de modelo 'Usuario'


var port = process.env.PORT || 8000; //aqui estamos configurando a porta da nossa api. Onde irá: criar e verificar os tokens tbm
mongoose.connect(config.database, {
    keepAlive: true,
    reconnectTries: Number.MAX_VALUE,
    useMongoClient: true
  }); //aqui iremos conectar a base de dados
app.set('superNode-auth', config.configName); //variável que criamos no arquivo 'config'

//Aqui estamos usando o 'body-parser' para obter as informações das requisições via POST (parâmetros)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//aqui estamos usando o 'morgan' para criar um log de requisições através do console de qualquer alteração que tivermos em nossa api:
app.use(morgan('dev'));

//Rota Padrão da API:
app.get('/', function(req, res) {
    res.send('Seja Bem-Vindo a API: http://localhost:' + port + '/api');
});

//Aqui estamos obtendo a instância do router para as rotas das APIs:
var apiRoutes = express.Router();

//TODO: Criar a rota: /authenticate: http://localhost:8000/authenticate

apiRoutes.post('/authenticate', function(req, res) {
    
    //Aqui estaremos buscando o usuário
    Usuario.findOne({
       nome: req.body.nome 
    }, function(error, usuario) {
        if(error)
            throw error;

        if(!usuario) {
            res.json({ success: false, message: 'Autenticação do Usuário falhou. Usuário não encontrado!' });
        } else if (usuario) {

            //Aqui iremos verificar se a senha bate com o que está cadastrado no banco:
            if(usuario.senha != req.body.senha) {
                res.json({ success: false, message: 'Autenticação do Usuário falhou. Senha incorreta!' });
            } else {
                // caso a senha do usuário seja encontrada.... iremos criar um token:
                var token = jwt.sign(usuario, app.get('superNode-auth'), {
                    expiresInMinutes: 1440 //o token irá expirar em 24 horas
                });

                //Aqui iremos retornar a informação do token via JSON:
                res.json({
                    success: true,
                    message: 'Token criado!!!',
                    token: token
                });
            }
        }
    });
});

//TODO: Criar a rota middleware para poder verificar e autenticar o token
apiRoutes.use(function(req, res, next) {

    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if(token) {
        jwt.verify(token, app.get('superNode-auth'), function(err, decoded) {      
            if (err) {
                return res.json({ success: false, message: 'Falha ao tentar autenticar o token!' });    
            } else {
            //se tudo correr bem, salver a requisição para o uso em outras rotas
            req.decoded = decoded;    
            next();
            }
        });

        } else {
        // se não tiver o token, retornar o erro 403
        return res.status(403).send({ 
            success: false, 
            message: 'Não há token.' 
        });       
    }
});

//Rota para mostrar a mensagem aleatória em: GET http://localhost:8000/api
apiRoutes.get('/', function(req, res) {
    res.json({ message: 'Bem-Vindo ao Nossa Linda API!!! '});
});

//Rota para retornar todos os usuários: GET: http://localhost:8000/usuarios
apiRoutes.get('/usuarios', function(req, res){
    Usuario.find({}, function(error, usuarios){
        res.json(usuarios);
    });
});

//E aqui iremos aplicar as rotas para a nossa aplicação com o prefixo: /api:
app.use('/api', apiRoutes);

//Demais rotas:
app.get('/create', function(req, res){
    //Aqui iremos criar um usuário de exemplo - todas as vezes que formos usar essa rota aparecerá esse usuário
    var usuarioExemplo = new Usuario({
        nome: 'Valdir Torres',
        senha: 'senha123',
        admin: true
    });

    //Aqui estaremos salvando esse usuário de exemplo:
    usuarioExemplo.save(function(error) {
        if(error)
            throw error;

        console.log('Usuário Criado com Sucesso!');
            res.json({
               success: true 
            });
    });
});

//Iniciamos o server via node server.js
app.listen(port);
console.log('Aplicação sendo executada em http://locahost:' + port);
