import mongoose from 'mongoose'
const user ="samsara-developer"
const pass="weTUGNgc38yvcJXd"
const url=`mongodb+srv://${user}:${pass}@cluster0.j55wq4d.mongodb.net/?retryWrites=true&w=majority`;
const connection = async () => {
  try {
    mongoose.connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    )
    console.log('DB CONNECTION ESTABLISHED')
  } catch (err) {
    console.log(err)
  }
}

export default connection
