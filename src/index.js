import { Component } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

import Header from './components/Header/Header'
import Products from './components/Products/Products';
import Details from './components/Details/Details';
import Cart from './components/Cart/Cart'

import './index.css'

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_SERVER || 'http://localhost:4000/',
  cache: new InMemoryCache()
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: "",
      currency: "USD",
      cartItems: [],
      currencyActive: false,
      minicartActive: false
    }
  }

  setCategory = (category) => {
    this.setState((state) => ({ 
      ...state,
      category: category
    }))
  }

  setCurrency = (currency) => {
    this.setState((state) => ({ 
      ...state,
      currency: currency
    }))
  }

  setCartItems = (products) => {
    this.setState((state) => ({ 
      ...state,
      cartItems: products
    }))
  }

  setCurrencyActive = (boolean) => {
    this.setState((state) => ({ 
      ...state,
      currencyActive: boolean
    }))
  }

  setMinicartActive = (boolean) => {
    this.setState((state) => ({ 
      ...state,
      minicartActive: boolean
    }))
  }

  onAdd = (product, selectedOptions) => {
    const { cartItems } = this.state;
    const { setCartItems } = this;

    if(!selectedOptions) {
      selectedOptions = product.selectedOptions ? product.selectedOptions : []
    }

    const sameProduct = cartItems
      .filter((x) => x.id === product.id)
      .find(x => JSON.stringify(x.selectedOptions) === JSON.stringify(selectedOptions))

    if(sameProduct) {
      setCartItems(
        cartItems.map((x) => 
          x.uniqueId === sameProduct.uniqueId ? { ...sameProduct, qty: sameProduct.qty + 1 } : x
        )
      )
    } else {
      setCartItems([
        ...cartItems, 
        { 
          ...product, 
          uniqueId: cartItems[0] ? cartItems[cartItems.length - 1].uniqueId + 1 : 0,
          qty: 1, 
          selectedOptions 
        }
      ])
    }
  }

  onRemove = (product) => {
    const exist = this.state.cartItems.find((x) => x.uniqueId === product.uniqueId);
    if(exist.qty === 1) {
      this.setCartItems(this.state.cartItems.filter((x) => x.uniqueId !== product.uniqueId));
    } else {
      this.setCartItems(
        this.state.cartItems.map((x) => 
          x.uniqueId === product.uniqueId ? { ...exist, qty: exist.qty - 1 } : x
        )
      )
    }
  }

  onChange = (product, id, value) => {
    this.setCartItems(
      this.state.cartItems.map((x) => 
        x.uniqueId === product.uniqueId ? { ...product, selectedOptions: [ 
          ...product.selectedOptions.filter(option => option.id !== id), {id, value} 
        ] } : x
      )
    )
  }

  render(){
    return (
      <div>
        <Header 
          category={this.state.category}
          setCategory={this.setCategory} 
          currency={this.state.currency} 
          setCurrency={this.setCurrency} 

          currencyActive={this.state.currencyActive}
          setCurrencyActive={this.setCurrencyActive}
          minicartActive={this.state.minicartActive}
          setMinicartActive={this.setMinicartActive}

          cartItems={this.state.cartItems}
          setCartItem={this.setCartItems}
          onAdd={this.onAdd} 
          onRemove={this.onRemove}
          onChange={this.onChange} 
        />

      <div 
        className={
          this.state.minicartActive ? 'overlay' :  this.state.currencyActive ? 'hidden-overlay' : undefined
        } 
        onClick={() => {
          this.setMinicartActive(false)
          this.setCurrencyActive(false)
        }}>
      </div>
        
      <Switch>
        <Route exact path="/" children={<Products currency={this.state.currency} cartItems={this.state.cartItems} onAdd={this.onAdd} />} />
        <Route exact path="/category/:category" children={<Products currency={this.state.currency} cartItems={this.state.cartItems} onAdd={this.onAdd} />} />
        <Route exact path="/product/:id" children={<Details currency={this.state.currency} onAdd={this.onAdd} />} />
        <Route exact path="/cart" children={
          <Cart 
            cartItems={this.state.cartItems} 
            currency={this.state.currency} 
            onAdd={this.onAdd} 
            onRemove={this.onRemove} 
            onChange={this.onChange} 
          />} 
        />
      </Switch>
    </div>
    )
  }
}

render(
  <BrowserRouter>
    <ApolloProvider client={client}>    
      <App />  
    </ApolloProvider>
  </BrowserRouter>,  
  document.getElementById('root'),
);