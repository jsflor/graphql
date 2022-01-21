const { ApolloServer, gql } = require('apollo-server');

const LIBRARIES_DB = [
  {
    branch: 'downtown'
  },
  {
    branch: 'riverside'
  },
];

// The branch field of a book indicates which library has it in stock
const BOOKS_DB = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
    branch: 'riverside'
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
    branch: 'downtown'
  },
];

const typeDefs = gql`
  type Author {
    name: String!
  }

  type Book {
    title: String!
    author: Author!
  }

  type Library {
    branch: String!
    books: [Book]!
  }

  input CreateBookInput {
    title: String
    author: String
    branch: String
  }

  type Query {
    authors: [Author]
    books: [Book]
    libraries: [Library]
  }

  type Mutation {
    createBook(data: CreateBookInput): Book
  }
`
const resolvers = {
  Library: {
    books: (parent) => {
      return BOOKS_DB.filter(book => book.branch === parent.branch);
    }
  },
  Book: {
    author: (parent) => {
      return {
        name: parent.author,
      }
    }
  },
  Mutation: {
    createBook: (
      parent, // previous resolver in the resolver chain
      args, // object that contains all GraphQL arguments provided for this field
      context, // object shared across all resolvers that are executing for a particular operation
      info // information about the operation's execution state, including the field name...
    ) => {
      const { title, author, branch } = args.data;
      const isNewBranch = LIBRARIES_DB.filter(library => library.branch === branch)?.length === 0;
      const newBook = {
        title,
        author,
        branch
      }

      if (isNewBranch) {
        LIBRARIES_DB.push({
          branch
        })
      }

      BOOKS_DB.push(newBook);

      return newBook;
    }
  },
  Query: {
    authors: () => {
      return BOOKS_DB.map((book) => ({
        name: book.author,
      }));
    },
    books: () => {
      return BOOKS_DB;
    },
    libraries: () => {
      return LIBRARIES_DB;
    },
  },
}

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`));