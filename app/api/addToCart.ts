import { gql } from '@apollo/client/core';
import client from '~/lib/apolloClient';


const CART_CREATE_MUTATION = gql`
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADD_TO_CART_MUTATION = gql`
  mutation checkoutLineItemsAdd($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
    checkoutLineItemsAdd(checkoutId: $checkoutId, lineItems: $lineItems) {
      checkout {
        id
        webUrl
        lineItems(first: 10) {
          edges {
            node {
              id
              title
              quantity
              variant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                image {
                  src
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

async function createCart() {
  const response = await client.mutate({
    mutation: CART_CREATE_MUTATION,
    variables: {
      input: {
        
      },
    },
    fetchPolicy: "network-only",
  });

  if (response.errors) {
    throw new Error(`Error en la solicitud: ${response.errors.map((error) => error.message).join(', ')}`);
  }

  if (response.data.checkoutCreate.userErrors.length > 0) {
    const userErrors = response.data?.checkoutCreate?.userErrors || [];
    const errorMessages = userErrors.map((error: any) => error.message).join(', ');
    throw new Error(`Error en la respuesta de GraphQL: ${errorMessages}`);
  }

  return response.data.cartCreate.cart.id;
}

export async function addToCart(variantId: string, quantity: number) {
  try {
    let checkoutId = localStorage.getItem('checkoutId');

    if (!checkoutId) {
      checkoutId = await createCart();
      localStorage.setItem('checkoutId', checkoutId || '');
    }

    const response = await client.mutate({
      mutation: ADD_TO_CART_MUTATION,
      variables: {
        checkoutId,
        lineItems: [
          {
            variantId,
            quantity,
          },
        ],
      },
      fetchPolicy: "network-only",
    });


    if (response.errors) {
      throw new Error(`Error en la solicitud: ${response.errors.map((error) => error.message).join(', ')}`);
    }

    if (response.data.checkoutLineItemsAdd.userErrors.length > 0) {
      const userErrors = response.data?.checkoutLineItemsAdd?.userErrors || [];
      const errorMessages = userErrors.map((error: any) => error.message).join(', ');
      throw new Error(`Error en la respuesta de GraphQL: ${errorMessages}`);
    }

    return response.data.checkoutLineItemsAdd.checkout;
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    throw error;
  }
}