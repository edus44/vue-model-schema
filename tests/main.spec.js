const Schema = require('../src/Schema')

class User extends Schema {
  // static rowId = 'id'
  // static model = {
  //   id: String,
  //   name:{
  //     type:String,
  //   }
  // }
  // static resource = {}
}

User.field('id', String)
User.field('tags', [String])
User.field('name', {
  type: String,
})

const user = new User({
  id: 'tal',
  name: 'pepe',
  createdAt: 1571824757133,
})

// user.$save()

it('should work', () => {
  console.log(User)
})
