import { ChakraProvider } from '@chakra-ui/react';
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import theme from '../theme';
import { AppProps } from 'next/app';
import { cacheExchange, QueryInput, Cache } from '@urql/exchange-graphcache';
import { LoginMutation, Maybe, MeDocument, MeQuery, RegisterMutation, User } from '../generated/graphql';

// For improved type for exchange cache
function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query | { me: Maybe<{ __typename?: "User"; } & Pick<User, "id" | "username">> | undefined }
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}


const client = createClient({
  url: 'http://localhost:4000/graphql',
  fetchOptions: () => {
    return {
      credentials: "include"
    };
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        login: (_result, args, cache, info) => {
          betterUpdateQuery<LoginMutation, MeQuery>(
            cache, { query: MeDocument }, _result, (result, query) => {
              if (result.login.errors) {
                return query;
              } else {
                return {
                  me: result.login.user,
                }
              }
            }
          );
        },
        register: (_result, args, cache, info) => {
          betterUpdateQuery<RegisterMutation, MeQuery>(
            cache, { query: MeDocument }, _result, (result, query) => {
              if (result.register.errors) {
                return query;
              } else {
                return {
                  me: result.register.user,
                }
              }
            }
          );
        },
      },
    },
  }), fetchExchange],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
