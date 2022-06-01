# EVENT HERO (CLIENT)

<br>

# Quick Compo

<br>

## Description

Thisis an wallet app to be used in events like concerts, shows, festivals, ... In the app, you can put balance in your wallet and spend it on any event that you are attending to.

## User Stories

- **404:** As a user I get to see a 404 page with a feedback message if I try to reach a page that does not exist so that I know it's my fault.
- **Signup:** As an anonymous user I can sign up on the platform so that I can start creating and managing tournaments.
- **Login:** As a user I can login to the platform so that I can access my profile and start creating and managing tournaments.
- **Logout:** As a logged in user I can logout from the platform so no one else can use it.
- **My Account Page**: As a logged in user I can visit my account page so that I can access the edit page and also to see my current balance, with the option to put more money in the wallet.
- **Events Page:**: List of events registered in the platform that the user can choose to attend.
- **My Events page:** List of events, filtered by today's event, upcoming events and past events
- **Today's Events:** All events happening today are enabled for the user to place order, where he chooses the products that he wants to buy and places the order.
- **Order Page:** The order page will display a QR code and details of the current order, so that the event staff can scan it and deduct the balance of the user when the goods are delivered.
- **Event Admin:** There is going to be an admin page por event owners, that they can manage the products that they are going to be selling during the event, include authorized sales staff and a dashboard view with graphs and data related to that event.
- **App Owner Admin:** Specific page for the owner of the app, that shows a list of all users in the platform, dashboard with an overview of all events and also sales, profits and revenue.

## Backlog

- Implement socket.io, update order screen on scan
- fake credit card package
- tweak admin pages

<br>

# Client / Frontend

## React Router Routes (React App)

| Path               | Component          | Permissions                | Behavior                                                      |
| ------------------ | ------------------ | -------------------------- | ------------------------------------------------------------- |
| `/login`           | LoginPage          | anon only `<AnonRoute>`    | Login form, navigates to home page after login.               |
| `/signup`          | SignupPage         | anon only `<AnonRoute>`    | Signup form, navigates to home page after signup.             |
| `/`                | HomePage           | public `<Route>`           | Home page.                                                    |
| `/my-account`      | AccountPage        | user only `<PrivateRoute>` | User account with balance                                     |
| `/my-account/edit` | DetailsAccountPage | user only `<PrivateRoute>` | Edit user info and add balance form.                          |
| `/events`          | EventsPage         | user only `<AnonRoute>`    | List of available events.                                     |
| `/my-events`       | MyEvents           | user only `<PrivateRoute>` | List of attendng events.                                      |
| `/event/:eventId`  | EventDetailPage    | user only `<PrivateRoute>` | Event details. If event is set for today, enables order form. |
| `/order/:orderId`  | OrderPage          | user only `<PrivateRoute>` | Order details page.                                           |
| `/admin`           | AdminPage          | user only `<PrivateRoute>` | ADmin page for event owners and app owner.                    |

## Components

Pages:

- LoginPage

- SignupPage

- HomePage

- ProfilePage

- AddBalancePage

- EventListPage

- MyEventsPage

- OrderPage

- AdminPage

Components:

## Services

<br>

# Server / Backend

## Models

**User model**

```javascript
  {
    email: {
      type: String,
      unique: true,
      require: true,
      lowercase: true,
      // unique: true -> Ideally, should be unique, but its up to you
    },
    hashedPassword: { type: String, required: true },
    profileImg: {
      type: String,
    },
    balance: { type: Number, min: 0, default: 0 },
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    type: {
      type: String,
      enum: ["user", "app-admin", "event-admin", "event-staff"],
      required: true,
    },
    active: { type: Boolean, required: true, default: true },
  }
```

**Event model**

```javascript
  {
    name: {
      type: String,
      require: true,
    },
    date: { type: Date, require: true },
    splashImg: {
      type: String,
    },
    type: {
      type: String,
      enum: ["normal", "open-bar"],
      required: true,
    },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    staff: [{ type: Schema.Types.ObjectId, ref: "User" }],
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    active: { type: Boolean, required: true, default: true },
  }
```

**Product model**

```javascript
  {
    name: {
      type: String,
      require: true,
    },
    date: { type: Date, require: true },
    productImg: {
      type: String
    },
    manufacturer: {
      type: String,
      require: true,
    },
    price: { type: Number, min: 0, required: true },
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    active: { type: Boolean, required: true, default: true },
  }
```

**Order model**

```javascript
  {
    total: {
      type: Number,
      require: true,
    },
    bgColor: String,
    status: { type: Number, default: 10, min: 0 },
    products: [
      {
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    event: { type: Schema.Types.ObjectId, ref: "Event" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  }

<br>

## API Endpoints (backend routes)

| HTTP Method | URL                    | Request Body                 | Success status | Error Status | Description                                                                                                                     |
| ----------- | ---------------------- | ---------------------------- | -------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| GET         | `/auth/profile `| Saved session                               | 200            | 404          | Check if user is logged in and return profile page                                                                              |
| POST        | `/auth/signup`  | {name, email, password}                     | 201            | 404          | Checks if fields not empty (422) and user not exists (409), then create user with encrypted password, and store user in session |
| POST        | `/auth/login`   | {email, password}                           | 200            | 401          | Checks if fields not empty (422), if user exists (404), and if password matches (404), then stores user in session              |
| GET         | `/api/events`   |                                             |                | 400          | Show all events
| GET         | `/api/event/:id`|                                             |                |              | Show specific event
| POST        | `/api/event`    | { name, img, date, products, type }         | 201            | 400          | Create new event
| PUT         | `/api/event/:id`| { name, img, date, products, active, type } | 200            | 400          | edit event
| DELETE      | `/api/event/:id`|                                             | 201            | 400          | delete event
| GET         | `/api/order/:id`|                                             |                |              | show order details
| POST        | `/api/order`    | { productsInfo }                            | 200            | 404          | adds new order
| DELETE      | `/api/order/:id`|                                             | 200            | 400          | delete order
| GET         | `/api/admin`    |                                             | 201            | 400          | show admin details

<br>

## API's

<br>

## Packages

[React-admin](https://marmelab.com/react-admin/)
[QRCode](https://www.npmjs.com/package/react-qr-code)
[MomentJS](https://momentjs.com/)
[MaterialUI](https://mui.com/)
[SocketIo](https://socket.io/)

<br>


### Git

[Client repository Link](https://github.com/dinaco/event-hero-client)

[Server repository Link](https://github.com/dinaco/event-hero-server)

[Deployed App Link](http://heroku.com)


### Developer

Dino Marchiori - <https://github.com/dinaco/> - <https://www.linkedin.com/in/dino-marchiori/>
```
