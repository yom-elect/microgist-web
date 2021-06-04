import React from 'react';
import { Form, Formik } from 'formik';
import Wrapper from '../components/wrapper';
import InputField from '../components/InputField';
import { Box, Button } from '@chakra-ui/react';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErroMap';
import { useRouter } from 'next/router';


interface LoginProps { };

const Login: React.FC<LoginProps> = () => {
  const router = useRouter();
  const [, login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik initialValues={{ username: "", password: "" }} onSubmit={async (values, { setErrors }) => {
        const response = await login(values); //login({options: values})
        if (response.data?.login.errors) {
          setErrors(toErrorMap(response.data.login.errors));
        } else if (response.data?.login.user) {
          router.push("/");
        }
      }}>
        {
          ({isSubmitting}) => (
            <Form>
              <InputField name="username" placeholder="username" label="Username" />
              <Box mt={4}>
              <InputField name="password" placeholder="password" label="Password" type= "password"/>
              </Box>
              <Button
                mt={4}
                colorScheme="teal"
                isLoading={isSubmitting}
                type="submit"
              >
                login
            </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};


export default Login;
