/*
Arquivo: usuario.js
Data: 08/07/2018
Author: Valdir Torres
Observação: arquivo responsável por definir o modelo do 'Usuario' com a base de dados.
*/

//Aqui iremos pegar a instância do mongoose:
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Aqui iremos configura um modelo e depois usar o module.exports:
module.exports = mongoose.model('Usuario', new Schema({
    nome: String,
    senha: String,
    admin: Boolean
}));