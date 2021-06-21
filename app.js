const express = require("express");                         // 
const bodyParser = require("body-parser"); 
const path = require("path");                               //
const mongoose = require("mongoose");
const { stringify } = require("querystring");
const session = require("express-session");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError")
// the new schema model:
const Participant = require("./models/participant");
const Event = require("./models/event");
const Start = require("./models/start");
const ParticipantsStart = require("./models/participantsStart");
const mongoSanitize = require("express-mongo-sanitize");
const { events } = require("./models/participant");
const methodOverride = require("method-override");
const {isLoggedIn} = require("./middelware");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const User = require("./models/user");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const sessionConfig = {
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60*60*24*7,
        maxAge: 1000 * 60*60*24*7
    }
}
const app = express();

app.use(session(sessionConfig));
app.use(flash());
app.engine("ejs", ejsMate)


// CONNECTING TO MONGODB -----------------------------------------------------------
mongoose.connect("mongodb://localhost:27017/testrun-timer", {
    useNewUrlParser: true, 
    useCreateIndex: true, 
    useUnifiedTopology: true,
    useFindAndModify: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));
app.use(mongoSanitize());


// TIMING -----------------------------------------------------------------------------------
app.post("/timings/:id", isLoggedIn, catchAsync(async(req, res)=> {
    
    // defining trhe event first:
    const event = new Event({name: req.body.name, author: req.user});
    // får her tilgang til det aktuelle start-objektet
    const  {id} = req.params;
    const start = await Start.findById(id).populate("participantsStart");
    console.log(start);
    let list=[];
    for(i in start.participantsStart){
        list.push(start.participantsStart[i].participantNumber)
    };
    console.log(list);
    // splitting req.boduy.timing into readable objects.
        const timingObject = (req.body.timing);
        const timingObjectSplit = timingObject.split(',');
        //saves the participant objects in separate collection in DB.
        for(i in timingObjectSplit){
            var name = "";
            const participantSplit = timingObjectSplit[i].split('S');
            console.log(participantSplit[1]);       
            
            for(j in start.participantsStart){
                if(start.participantsStart[j].participantNumber == participantSplit[1]){
                    console.log("!YES");
                    var name = start.participantsStart[j].name;
                };
            };
            var participant = new Participant({time: participantSplit[0], 
                        participantNumber: participantSplit[1],
                        name: name});
                    await participant.save();
                    event.participants.push(participant);          
        };  
        await event.save();    
        res.redirect(`/results/${event._id}/show`)
            req.flash("success", "successfully saved"); 
        
}));

app.put("/events/:id", catchAsync(async(req, res) => {
    const {id} = req.params;
    const event = await Event.findByIdAndUpdate(id, { ... req.body.event, comment: req.body.comment});
    console.log()
}));

// STARTLISTER -------------------------------------------------------------------------

app.delete("/deleteStart/:id", isLoggedIn, catchAsync(async(req, res)=>{
    const { id } = req.params;
    await Start.findByIdAndDelete(id);
    res.redirect("/participants")
}));
app.get("/participants/:id/show", isLoggedIn, catchAsync(async(req, res)=>{
    const start = await Start.findById(req.params.id).populate("participantsStart");
    res.render("showStart", { start } );
}));
app.post("/start", isLoggedIn, catchAsync(async(req, res, next) => {
    
    const start = await new Start({name: req.body.name, author: req.user});
    const timingObject = (req.body.participants);
    const timingObjectSplit = timingObject.split(',');
    for(i in timingObjectSplit){
        const participantSplit = timingObjectSplit[i].split(';');
        const participantStart = new ParticipantsStart({name: participantSplit[0], 
            participantNumber: participantSplit[1]});
        await participantStart.save();
            start.participantsStart.push(participantStart);
    };
    await start.save();
    const starts = await Start.find({}).populate("participantsStart");
    res.render("participants", {starts})
    
}));

app.get("/participants", isLoggedIn, async(req, res)=>{
    const starts = await Start.find({});
    res.render("participants", {starts});
})




// PROFIL, ENKEL TIMING -----------------------------------------------------------------------

app.get("/profil", isLoggedIn, catchAsync(async(req, res)=>{
    res.render("profil")
}));
app.get("/timingEasy", catchAsync(async(req, res)=>{
    res.render("timingEasy")
}));





// RESULTS ------------------------------------------------------------------------------------
app.get("/timingRender/:id/timing", isLoggedIn, catchAsync(async(req, res)=>{
    const  {id} = req.params;
    const start = await Start.findById(id).populate("participantsStart");
    res.render("timing", {start})
}));


app.get("/results", isLoggedIn, catchAsync(async(req, res, next)=>{
    const timings = await Event.find({}).populate("participants");
    res.render("results", { timings })
}));


app.get("/results/:id/show", isLoggedIn, catchAsync(async(req, res) => {
    const event = await Event.findById(req.params.id).populate('participants');
    event.participants = Participant;
    res.render("show", { event } );
}));
app.get("/user", (req, res)=> {
    res.render("user");
});



// USER --------------------------------------------------------------------------------
app.post("/register", catchAsync(async(req, res)=>{
    
    const {email, username, password} = req.body;
    const user = new User({email, username });
    const registeredUser = await User.register(user, password);
    res.redirect("/");
    req.flash("success", "successfully registered");
    
}));

app.delete("/delete/:id", isLoggedIn, catchAsync(async(req, res) =>{
    
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.redirect("/results")
    
}));

app.post("/newEvent", isLoggedIn,  catchAsync(async(req, res)=>{
    
    const event = new Event({name: req.body.name, author: req.body.user});
    res.render("participants", {event})
    
}));

app.post("/newParticipant", catchAsync(async(req, res)=>{
    
    const participant = new Participant({name: req.body.name, participantNumber: req.body.participantNumber});
    const participants = Participant.find({});
    res.render("participants", {participants})
    
}));

app.get("/login", (req, res)=>{
    res.render("login")
});
app.post("/login",  passport.authenticate("local", {failureFlash: true, failureRedirect: "/login" }), catchAsync(async(req, res)=> {
    const currentUser = req.user;
    await res.render("home", {currentUser});
}));
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
})



// Rendering the "home" tab
app.get("/", (req, res)=>{
    res.render("home")
});

// error handeling
app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found ", 404))
});

// error
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!'
    res.status(statusCode).render('error', { err })
});

// Just notifying connection to server
app.listen(3000, ()=>{
    console.log("serving on port 3000")
})