const express = require('express');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const path = require("path");
const cookieSession = require('cookie-session');
  
//Express
const app = express(); 
const port = 3000;

//Mongo
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/newdatabase', { 
    useNewUrlParser: true ,
    useUnifiedTopology: true
});

mongoose.connection.on("error", (error) => console.log(error));
mongoose.connection.once("open", () => console.log("Mongoose conectado"));

const UserSchema = mongoose.Schema({      
    name: String,  
    email: String,
    password: String,           
});

UserSchema.statics.authenticate = async function(email, password)  {
    const user = await this.model("User").findOne({ email: email})

    if(user){        
        const match = await bcrypt.compare(password, user.password);
        return match ? user : null;
    }
    return false;
};

const UserModel = mongoose.model("User", UserSchema);

//Routes

app.use(
    cookieSession({
      secret: "make-it-real",
      maxAge: 5 * 60 * 1000,
    })
  );

  app.use(express.urlencoded({ extended: true }));

  app.use("/", express.static(path.join(__dirname, "public")));

  app.post('/login', async (req, res) => {

    const { email, password } = req.body;               
    
    const user = await UserModel.authenticate(email, password);

    if(user){
    // req.session.userId = user._id;
        res.redirect('/');
    }
    res.redirect('/login');                       
 });

 app.get('/logout', (req, res) => {     
    req.session.userId = null;
    res.redirect('/login')
});

app.post('/register', async (req, res) => {   
    
    const { name, email, password} = req.body;

    const user = new UserModel({  
        name,  
        email, 
        password: await bcrypt.hash(password, 10)                                                
    });
    
     user.save(async (error) => {
        if (error) {
            console.log(error);
            return;
        }
        console.log("Visit created");           
    });    

    const userData = await UserModel.authenticate(email, password);

    if (user) {
      req.session.userId = userData._id;
    }

    res.redirect('/');   
});

app.get('/', async (req, res) => {   
    
    if (req.session.userId){
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
    
            res.send(`<a href="/logout">Salir</a>
                    <table>
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
    }else{
        res.redirect('/login');     
    }    
});

app.listen(port, () => console.log(`Listening on port ${port}`));


