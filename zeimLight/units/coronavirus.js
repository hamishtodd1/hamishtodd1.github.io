/*
    Epidemeological sim with economic effects added to answer: "how many lives are we saving by doing this?"
        There's nothing to be done about some people being vectors - nurses and doctors. So you probably have some probability distribution of connections
        What you (Toby Gilland!) want to see is the lives you are saving by not going out
        It helps their stock
        viz of ICU beds
        http://gabgoh.github.io/COVID/index.html
        Eventually
            You probably do want a country-wide spatial model

    People want to know
        Who am I helping and how much?
        How long vaccine will take
        Why does it take that long?
        What about this thing I heard?

    Spread of fake news matters too

    Hey maybe Hanson is right?

    As a peronal story I will say that I just met a nice girl for the first time in several years

    Joel paper https://www.thelancet.com/journals/langlo/article/PIIS2214-109X(20)30074-7/fulltext
*/

function initCoronavirus()
{
    console.log("y")

    //https://en.wikipedia.org/wiki/Compartmental_models_in_epidemiology#The_SEIR_model
    let birthRate = .01; //capital alpha
    let deathRate = birthRate; //mu

}