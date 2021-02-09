const request = require('supertest').agent(require('../db'));
const db = require('../db');

describe('POST /books', () => {
  beforeEach(() => {
    console.log("db clearing");
    db.clear(); 
  });

  afterEach(() => {
    db.reset();
  });

  it('should create a new post', async () => {
    console.log("await request");
    
    const res = await request
      .post('/books')
      .send({
        title: 'A Test Book',
        author: 'A Test Author',
        isbn: '0198239467'
      })
      .catch(error => {
        console.error(error)
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('post');
  });
})

