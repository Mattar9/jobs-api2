require('dotenv').config();

const mockData = require('./mock-data.json');

const Job = require('./models/job');
const connectDB = require('./db/connect')

const start = async ()=>{
    try {
        await connectDB(process.env.MONGODB_URI);
        await Job.create(mockData)
        console.log('success')
        process.exit(0)
    }catch(err){
        console.log(err)
        process.exit(1)
    }
}

start()