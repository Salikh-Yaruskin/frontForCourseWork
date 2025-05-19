import * as React from 'react';
import classNames from 'classnames';

export default class LoginForm extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {
      active: "login",
      username: "username",
      password: "password",
      onLogin: props.onLogin,
    };
  }
  
  onChangeHandler = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name] : value});
  };

  onSubmitLogin = (e) => {
        this.state.onLogin(e, this.state.username, this.state.password);
    };

  render() {
    return (
      <div className="row justify-content-center">
        <div className="col-4">

          <div className="tab-content">
            <div className={classNames("tab-pane", "fade", this.state.active === "login" ? "show active" : "")} id="pills-login" >
                <form onSubmit={this.onSubmitLogin}>

                  <div className="form-outline mb-4">
                    <input type="username" id="username" name= "username" className="form-control" onChange={this.onChangeHandler}/>
                    <label className="form-label" htmlFor="username">Username</label>
                  </div>

                  <div className="form-outline mb-4">
                    <input type="password" id="loginPassword" name="password" className="form-control" onChange={this.onChangeHandler}/>
                    <label className="form-label" htmlFor="loginPassword">Password</label>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block mb-4">Sign in</button>

                </form>
              </div>
          </div>
        </div>
      </div>
    );
  }
}