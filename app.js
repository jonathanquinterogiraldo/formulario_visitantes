const express = require('express');
const app = express(); 
app.use(express.urlencoded({ extended: true }));
const port = 3000;  

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/newdatabase', { 
    useNewUrlParser: true ,
    useUnifiedTopology: true
});

mongoose.connection.on("error", (error) => console.log(error));
mongoose.connection.once("open", () => console.log("Mongoose conectado"));

const usersSchema = mongoose.Schema({      
    name: String,  
    email: String,
    password: String,
    count: Number      
});

const UserModel = mongoose.model("User", usersSchema);

app.get('/', async (req, res) => {    

    UserModel.find({}, function(error, result){
        if (error) return console.error(error);
        console.log(result);
        let str= '';
        
        for (const users of result) { 
            console.log('users',users);
            str = str +`<tr>                        
                        <td>${users.name}</td>
                        <td>${users.email}</td>
                        </tr>`;                                             
        };    

        res.send(`<table>
            <thead>
                <tr>                    
                    <th>Nombre</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>               
                ${str}               
            </tbody>               
        </table>`);                
    });       
});

app.get('/register', async (req, res) => {
    res.send(`<form action="/register" method="post">
                <label for="name">Nombre</label>
                </br>
                <input type="text" name="name" id="name">
                </br>
                <label for="email">Email</label>
                </br>
                <input type="email" name="email" id="email">
                </br>
                <label for="email">Contraseña</label>
                </br>
                <input type="password" name="password" id="password">
                </br>
                <button type="submit">Enviar</button>
            </form>`);     
});

app.post('/register', async (req, res) => {       

    const user = new UserModel({  
         name: req.body.name,  
         email: req.body.email, 
         password: req.body.password                          
    });
  
    await user.save((error) => {
        if (error) {
            console.log(error);
            return;
        }
        console.log("Visit created"); 
        res.redirect('/');   
    });      
});

app.listen(port, () => console.log(`Listening on port ${port}`));


