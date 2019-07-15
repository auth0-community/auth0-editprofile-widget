# Auth0 Edit Profile Widget
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)
<img src="https://img.shields.io/badge/community-driven-brightgreen.svg"/> <br>

### Contributors

Thanks goes to these wonderful people who contribute(d) or maintain(ed) this repo([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://twitter.com/beardaway"><img src="https://avatars3.githubusercontent.com/u/11062800?v=4" width="100px;" alt="Conrad Sopala"/><br /><sub><b>Conrad Sopala</b></sub></a><br /><a href="#review-beardaway" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-beardaway" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://geekysrm.github.io"><img src="https://avatars1.githubusercontent.com/u/10224804?v=4" width="100px;" alt="Soumya Ranjan Mohanty"/><br /><sub><b>Soumya Ranjan Mohanty</b></sub></a><br /><a href="https://github.com/auth0-community/auth0-editprofile-widget/commits?author=geekysrm" title="Code">💻</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Intro

This widget provides a way to allow users to update their own profile.
It uses the user token to update the user metadata.

**Key Features**

* Provide an easy way to update your users' profile
* Plug 'n play user_metadata update
* Easily extensible to work with your own API (or with the provided Webtask) in order to update app_metadata and root attributes like `email`

This repo is supported and maintained by Community Developers, not Auth0. For more information about different support levels check https://auth0.com/docs/support/matrix .

## Getting Started

Add the `auth0-editprofile-widget.min.js` dependency, set up the form layout and initialize the widget with the user token:

```
<div id="editProfileContainer"></div>

<script src="build/auth0-editprofile-widget.min.js"></script>

<script type="text/javascript">

var editProfileWidget = new Auth0EditProfileWidget('editProfileContainer', { domain: auth_domain }, [
    { label: "Name", type:"text", attribute:"name",
      validation: function(name){
          return (name.length > 10 ? 'The name is too long' : null);
      }
    },

    { label: "Lastname", type:"text", attribute:"lastname" },

    { label: "BirthDay", type:"date", attribute:"birthday" },

    { label: "Type", type:"select", attribute:"account_type",
      options:[
        { value: "type_1", text:"Type 1"},
        { value: "type_2", text:"Type 2"},
        { value: "type_3", text:"Type 3"}
      ]
    }
]);

editProfileWidget.init(user_token);

</script>
```

Parameters:

* **auth0_domain**: it is your Auth0 account domain (ie: yourdomain.auth0.com)
* **container_id**: it should be the id of the DOM element where the widget will load
* **fields**: it is an array with the fields that the widget will show. Each of the has the following attributes:
    - **id**: Optional. this can be used to set a custom id to the field. By default, if not provided, it is generated using this template `field_${type}_${attribute}` but having several fields form the same tuple (attribute, type) will provide an id collision.
    - **label**: this is the input label text
    - **type**: input type (text, date, number, select, checkbox, radio)
    - **attribute**: this is the user_metadata attribute name where it will be saved
    - **validation**: it is a validation function that will be executed before calling the Auth0 API. If there is an error, the text returned by the function will be used as the error message. If null is returned, it will assume no error.
    - **render**: used for custom fields. It should return a valid HTML to be rendered by the widget.
    - **onChange**: event triggered on changes in the field. For custom fields, you will need to trigger it manually.

The form will be rendered when it is initialized and will request the user data when the init method is called with the logged in user token.

## Usage

### Events

* **loading**: this occurs before getting the user profile when the init method is called
* **loaded**: this occurs after getting the user profile when the init method is called
* **submit**: this occurs when the user submits the form, before the API is called
* **save**: this occurs after the API is called, if a success response is received
* **error**: this occurs if there is an error in the API call

### Updating users (Extending the widget)

By default, this widget provides a way to update the `user_metadata` using the user token. Since to update the `app_metadata` and the root attributes an `app_token` is needed, it shouldn't be done on the client side.

In this case, you need to implement your own connection strategy that will make a request to your backend and from there update the user data. You can also use the built-in connection strategy and webtask provided by the plugin in case you are working in a backendless app.

Create the webtask and copy the webtask URL to set as the WebtaskStrategy parameter:

```
wt create --name update_user_profile \
  --secret app_token=... \
  --secret client_secret=... \
  --secret domain=... \
  --output url update_user_profile.js --no-parse --no-merge
```

- **app_token**: it should be an app token generated in the [API Exporer](https://auth0.com/docs/api/v2) with `read:users`, `update:users` and `update:users_app_metadata` scopes
- **client_secret**: should be the client secret of the same app you are using in the client side. It is used to verify the user token
- **domain**: your auth0 account domain

and set the `connection_strategy`:

```
var editProfileWidget = new Auth0EditProfileWidget('editProfileContainer',
      {
        connection_strategy: new WebtaskStrategy({endpoint: 'https://yourendpoint...'})
      },
      ...
```

**options**:
- **endpoint**: the url to call to get and save the profile (by default both use this)
- **save_endpoint**: the url used to save the profile
- **save_method**: the HTTP method used to save the profile (by default `PATCH`)

### Creating a custom connection strategy

Connecting to an existing backend can have special requirements and different ways to call the API endpoint. In this case, you have the possibility to create your own connection strategy.

The connection strategy is an object that provides 3 methods:
- **get()**: this will return the entire Auth0 user object
- **setUserToken(user_token)**: this will set the user token to request and update the profile data. It is called when the init method is called.
- **patch(data)**: this will push the entire form data to the server

You can see the strategies provided by the widget as an example:
- [Auth0 Api Strategy](https://github.com/auth0/auth0-editprofile-widget/blob/master/lib/ConnectionStrategy/Auth0ApiStrategy.js): this calls directly the Auth0 API in order to update only the `user_metadata`.
- [Webtask Strategy](https://github.com/auth0/auth0-editprofile-widget/blob/master/lib/ConnectionStrategy/WebtaskStrategy.js): this will call the endpoint you set in the construct. It can be used to call any other endpoint besides the Webtask.

### Using custom fields

This widget support the ability to add custom fields in order to render your own controls. For example:

```
...
{ id:"customName", type:"custom", attribute:"name", render: function(value) {

  return '<div class="custom-field">Hi <b>'+value+'</b>, How you doing?</div>';
} },
...
```

This field will show a greeting showing dynamically the username.

### Updating field value

Calling the `updateFieldById` method, allows you to update other fields settings in order to update their value or settings.

```
editProfileWidget.updateFieldById('customName', {
  value:"New Name"
});
```

Parameters:

* **id**: the field id you want to update
* **options**: the field options to extend

## Contribute

Feel like contributing to this repo? We're glad to hear that! Before you start contributing please visit our [Contributing Guideline](https://github.com/auth0-community/getting-started/blob/master/CONTRIBUTION.md).

Here you can also find the [PR template](https://github.com/auth0-community/auth0-editprofile-widget/blob/master/PULL_REQUEST_TEMPLATE.md) to fill once creating a PR. It will automatically appear once you open a pull request.

## Issues Reporting

Spotted a bug or any other kind of issue? We're just humans and we're always waiting for constructive feedback! Check our section on how to [report issues](https://github.com/auth0-community/getting-started/blob/master/CONTRIBUTION.md#issues)!

Here you can also find the [Issue template](https://github.com/auth0-community/auth0-editprofile-widget/blob/master/ISSUE_TEMPLATE.md) to fill once opening a new issue. It will automatically appear once you create an issue.

## Repo Community

Feel like PRs and issues are not enough? Want to dive into further discussion about the tool? We created topics for each Auth0 Community repo so that you can join discussion on stack available on our repos. Here it is for this one: [auth0-editprofile-widget](https://community.auth0.com/t/auth0-community-oss-auth0-editprofile-widget/15977/3)

<a href="https://community.auth0.com/">
<img src="/assets/join_auth0_community_badge.png"/>
</a>

## License

This project is licensed under the MIT license. See the [LICENSE](https://github.com/auth0-community/auth0-editprofile-widget/blob/master/LICENSE) file for more info.

## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like
  * Google
  * Facebook
  * Microsoft
  * Linkedin
  * GitHub
  * Twitter
  * Box
  * Salesforce
  * etc.

  **or** enterprise identity systems like:
  * Windows Azure AD
  * Google Apps
  * Active Directory
  * ADFS
  * Any SAML Identity Provider

* Add authentication through more traditional [username/password databases](https://docs.auth0.com/mysql-connection-tutorial)
* Add support for [linking different user accounts](https://docs.auth0.com/link-accounts) with the same user
* Support for generating signed [JSON Web Tokens](https://docs.auth0.com/jwt) to call your APIs and create user identity flow securely
* Analytics of how, when and where users are logging in
* Pull data from other sources and add it to user profile, through [JavaScript rules](https://docs.auth0.com/rules)

## Create a free Auth0 account

* Go to [Auth0 website](https://auth0.com/signup)
* Hit the **SIGN UP** button in the upper-right corner
