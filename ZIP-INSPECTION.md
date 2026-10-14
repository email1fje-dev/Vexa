# گزارش بررسی ZIP پروژه Vexa

- فایل آرشیو: discord-clone-main (1).zip
- حجم: 1.3M

## ساختار فایل‌ها (حداکثر 250 مورد)
```text
discord-clone-main/.gitignore
discord-clone-main/LICENSE
discord-clone-main/README.md
discord-clone-main/backend/.dockerignore
discord-clone-main/backend/.editorconfig
discord-clone-main/backend/.env.example
discord-clone-main/backend/.eslintignore
discord-clone-main/backend/.eslintrc.json
discord-clone-main/backend/.gitattributes
discord-clone-main/backend/.gitignore
discord-clone-main/backend/.lintstagedrc.json
discord-clone-main/backend/.prettierignore
discord-clone-main/backend/.prettierrc.json
discord-clone-main/backend/LICENSE
discord-clone-main/backend/README.md
discord-clone-main/backend/docker-compose.dev.yml
discord-clone-main/backend/ecosystem.config.json
discord-clone-main/backend/package.json
discord-clone-main/backend/src/app.js
discord-clone-main/backend/src/config/config.js
discord-clone-main/backend/src/config/constants/modelsConstants.js
discord-clone-main/backend/src/config/passport.js
discord-clone-main/backend/src/config/roles.js
discord-clone-main/backend/src/config/tokens.js
discord-clone-main/backend/src/controllers/Auth/auth.controller.js
discord-clone-main/backend/src/controllers/Auth/auth.route.js
discord-clone-main/backend/src/controllers/Auth/validations/auth.validation.js
discord-clone-main/backend/src/controllers/Friend/acceptPendingRequest.js
discord-clone-main/backend/src/controllers/Friend/cancelPendingRequest.js
discord-clone-main/backend/src/controllers/Friend/createFriendRequest.js
discord-clone-main/backend/src/controllers/Friend/friend.route.js
discord-clone-main/backend/src/controllers/Friend/getAllFriends.js
discord-clone-main/backend/src/controllers/Friend/getPendingRequests.js
discord-clone-main/backend/src/controllers/Friend/index.js
discord-clone-main/backend/src/controllers/Friend/outGoingRequests.js
discord-clone-main/backend/src/controllers/Friend/validations/index.js
discord-clone-main/backend/src/controllers/Message/deleteMessage.js
discord-clone-main/backend/src/controllers/Message/editMessage.js
discord-clone-main/backend/src/controllers/Message/getMessages.js
discord-clone-main/backend/src/controllers/Message/index.js
discord-clone-main/backend/src/controllers/Message/message.route.js
discord-clone-main/backend/src/controllers/Message/sendMessage.js
discord-clone-main/backend/src/controllers/Message/validations/index.js
discord-clone-main/backend/src/controllers/Room/closeRoom.js
discord-clone-main/backend/src/controllers/Room/getOpenRooms.js
discord-clone-main/backend/src/controllers/Room/getOrCreateRoom.js
discord-clone-main/backend/src/controllers/Room/index.js
discord-clone-main/backend/src/controllers/Room/room.route.js
discord-clone-main/backend/src/controllers/Room/validations/index.js
discord-clone-main/backend/src/controllers/User/user.controller.js
discord-clone-main/backend/src/controllers/User/user.route.js
discord-clone-main/backend/src/controllers/User/validations/user.validation.js
discord-clone-main/backend/src/index.js
discord-clone-main/backend/src/lib/redisConnection.js
discord-clone-main/backend/src/middlewares/auth.js
discord-clone-main/backend/src/middlewares/error.js
discord-clone-main/backend/src/middlewares/validate.js
discord-clone-main/backend/src/models/friendRequest.model.js
discord-clone-main/backend/src/models/index.js
discord-clone-main/backend/src/models/message.model.js
discord-clone-main/backend/src/models/plugins/index.js
discord-clone-main/backend/src/models/plugins/paginate.plugin.js
discord-clone-main/backend/src/models/plugins/toJSON.plugin.js
discord-clone-main/backend/src/models/room.model.js
discord-clone-main/backend/src/models/token.model.js
discord-clone-main/backend/src/models/user.model.js
discord-clone-main/backend/src/routes/v1/index.js
discord-clone-main/backend/src/services/auth.service.js
discord-clone-main/backend/src/services/friend.service.js
discord-clone-main/backend/src/services/index.js
discord-clone-main/backend/src/services/message.service.js
discord-clone-main/backend/src/services/room.service.js
discord-clone-main/backend/src/services/token.service.js
discord-clone-main/backend/src/services/user.service.js
discord-clone-main/backend/src/socket/io.js
discord-clone-main/backend/src/socket/socket.routes.js
discord-clone-main/backend/src/utils/ApiError.js
discord-clone-main/backend/src/utils/catchAsync.js
discord-clone-main/backend/src/utils/pick.js
discord-clone-main/backend/src/validations/custom.validation.js
discord-clone-main/backend/yarn.lock
discord-clone-main/frontend/.babelrc
discord-clone-main/frontend/.env.development
discord-clone-main/frontend/.env.production
discord-clone-main/frontend/.env.staging
discord-clone-main/frontend/.eslintrc.js
discord-clone-main/frontend/.gitignore
discord-clone-main/frontend/.prettierignore
discord-clone-main/frontend/.prettierrc
discord-clone-main/frontend/LICENSE
discord-clone-main/frontend/README.md
discord-clone-main/frontend/config/paths.js
discord-clone-main/frontend/config/webpack.common.js
discord-clone-main/frontend/config/webpack.dev.js
discord-clone-main/frontend/config/webpack.prod.js
discord-clone-main/frontend/config/webpack.stag.js
discord-clone-main/frontend/package.json
discord-clone-main/frontend/postcss.config.js
discord-clone-main/frontend/public/favicon.ico
discord-clone-main/frontend/public/index.html
discord-clone-main/frontend/src/App.js
discord-clone-main/frontend/src/AppProviders.js
discord-clone-main/frontend/src/api/account/index.js
discord-clone-main/frontend/src/api/auth/index.js
discord-clone-main/frontend/src/api/client.js
discord-clone-main/frontend/src/api/friend/index.js
discord-clone-main/frontend/src/api/messages/index.js
discord-clone-main/frontend/src/api/room/index.js
discord-clone-main/frontend/src/api/socket/index.js
discord-clone-main/frontend/src/api/socket/useMeSocket.js
discord-clone-main/frontend/src/api/socket/useMessageSocket.js
discord-clone-main/frontend/src/app.styles.scss
discord-clone-main/frontend/src/assets/1f603.svg
discord-clone-main/frontend/src/assets/add_emoji_icon.svg
discord-clone-main/frontend/src/assets/add_friend_icon.svg
discord-clone-main/frontend/src/assets/all_users_icon.svg
discord-clone-main/frontend/src/assets/at_sign_icon.svg
discord-clone-main/frontend/src/assets/blocked_users_icon.svg
discord-clone-main/frontend/src/assets/camera_icon.svg
discord-clone-main/frontend/src/assets/center_bg_landing_header.svg
discord-clone-main/frontend/src/assets/close_icon.svg
discord-clone-main/frontend/src/assets/delete_icon.svg
discord-clone-main/frontend/src/assets/discord_logo.svg
discord-clone-main/frontend/src/assets/discord_mini_icon.svg
discord-clone-main/frontend/src/assets/dm_icon.svg
discord-clone-main/frontend/src/assets/emoji_icon.svg
discord-clone-main/frontend/src/assets/empty_dm_list.svg
discord-clone-main/frontend/src/assets/facebook_icon.svg
discord-clone-main/frontend/src/assets/fandom_landing.svg
discord-clone-main/frontend/src/assets/friends.svg
discord-clone-main/frontend/src/assets/gif_icon.svg
discord-clone-main/frontend/src/assets/gift_box_icon.svg
discord-clone-main/frontend/src/assets/hanging_out_easy_landing.svg
discord-clone-main/frontend/src/assets/horizontal_three_dots_icon.svg
discord-clone-main/frontend/src/assets/icons/favicon.png
discord-clone-main/frontend/src/assets/inbox_icon.svg
discord-clone-main/frontend/src/assets/instagram_icon.svg
discord-clone-main/frontend/src/assets/invite_only_landing.svg
discord-clone-main/frontend/src/assets/just_chiling_landing.svg
discord-clone-main/frontend/src/assets/left_bg_landing_header.svg
discord-clone-main/frontend/src/assets/loading_circle_icon.svg
discord-clone-main/frontend/src/assets/login_bg.png
discord-clone-main/frontend/src/assets/login_bg.svg
discord-clone-main/frontend/src/assets/lottie/start-chatting.json
discord-clone-main/frontend/src/assets/mark_icon.svg
discord-clone-main/frontend/src/assets/new_line.png
discord-clone-main/frontend/src/assets/nitro_icon.svg
discord-clone-main/frontend/src/assets/no_online_friends.svg
discord-clone-main/frontend/src/assets/offline_status_icon.svg
discord-clone-main/frontend/src/assets/pen_icon.svg
discord-clone-main/frontend/src/assets/pending_users_icon.svg
discord-clone-main/frontend/src/assets/pin_icon.svg
discord-clone-main/frontend/src/assets/plus.svg
discord-clone-main/frontend/src/assets/plus_icon.svg
discord-clone-main/frontend/src/assets/qr_code.png
discord-clone-main/frontend/src/assets/question_mark_icon.svg
discord-clone-main/frontend/src/assets/right_bg_landing_header.svg
discord-clone-main/frontend/src/assets/ring_phone_icon.svg
discord-clone-main/frontend/src/assets/stage_discovery.svg
discord-clone-main/frontend/src/assets/stickers_icon.svg
discord-clone-main/frontend/src/assets/three_dot_icon.svg
discord-clone-main/frontend/src/assets/tiny_stars_landing.svg
discord-clone-main/frontend/src/assets/twitter_icon.svg
discord-clone-main/frontend/src/assets/usa_flag.png
discord-clone-main/frontend/src/assets/user_plus_icon.svg
discord-clone-main/frontend/src/assets/youtube_icon.svg
discord-clone-main/frontend/src/components/Header.js
discord-clone-main/frontend/src/components/InnerChannels.js
discord-clone-main/frontend/src/components/Layout.js
discord-clone-main/frontend/src/components/LogoChannels.js
discord-clone-main/frontend/src/components/OnlineUsers.js
discord-clone-main/frontend/src/components/ProfileWidget.js
discord-clone-main/frontend/src/components/Setting/Account/Card.js
discord-clone-main/frontend/src/components/Setting/Account/UpdateCard.js
discord-clone-main/frontend/src/components/Setting/Account/UpdateEmail.js
discord-clone-main/frontend/src/components/Setting/Account/UpdateUserName.js
discord-clone-main/frontend/src/components/Setting/Account/index.js
discord-clone-main/frontend/src/components/Setting/Sidebar.js
discord-clone-main/frontend/src/components/Setting/index.js
discord-clone-main/frontend/src/components/chat/ChatBeginner.js
discord-clone-main/frontend/src/components/chat/Divider.js
discord-clone-main/frontend/src/components/chat/EmptyChat.js
discord-clone-main/frontend/src/components/chat/Input.js
discord-clone-main/frontend/src/components/chat/Message/DeleteModal.js
discord-clone-main/frontend/src/components/chat/Message/EditMessage.js
discord-clone-main/frontend/src/components/chat/Message/index.js
discord-clone-main/frontend/src/components/chat/MessageContainer.js
discord-clone-main/frontend/src/components/shared/DropDown/index.js
discord-clone-main/frontend/src/components/shared/Inputs/TextField/index.js
discord-clone-main/frontend/src/components/shared/Modal/AlertModal.js
discord-clone-main/frontend/src/components/shared/Modal/index.js
discord-clone-main/frontend/src/constants/history.constants.js
discord-clone-main/frontend/src/constants/queryKeys.js
discord-clone-main/frontend/src/constants/socket.routes.js
discord-clone-main/frontend/src/hooks/reactQuery/index.js
discord-clone-main/frontend/src/hooks/redux/index.js
discord-clone-main/frontend/src/index.js
discord-clone-main/frontend/src/index.scss
discord-clone-main/frontend/src/pages/Home/index.js
discord-clone-main/frontend/src/pages/Landing/Body.js
discord-clone-main/frontend/src/pages/Landing/Footer.js
discord-clone-main/frontend/src/pages/Landing/Header.js
discord-clone-main/frontend/src/pages/Landing/index.js
discord-clone-main/frontend/src/pages/Login/index.js
discord-clone-main/frontend/src/pages/Me/DMList/DMItem.js
discord-clone-main/frontend/src/pages/Me/DMList/index.js
discord-clone-main/frontend/src/pages/Me/DMPage/Header.js
discord-clone-main/frontend/src/pages/Me/DMPage/index.js
discord-clone-main/frontend/src/pages/Me/FriendsPage/AddFriend.js
discord-clone-main/frontend/src/pages/Me/FriendsPage/All/FriendItem.js
discord-clone-main/frontend/src/pages/Me/FriendsPage/All/index.js
discord-clone-main/frontend/src/pages/Me/FriendsPage/Blocked.js
discord-clone-main/frontend/src/pages/Me/FriendsPage/Menu.js
discord-clone-main/frontend/src/pages/Me/FriendsPage/Online.js
discord-clone-main/frontend/src/pages/Me/FriendsPage/Pending/PendingItem.js
discord-clone-main/frontend/src/pages/Me/FriendsPage/Pending/PendingProfileModal.js
discord-clone-main/frontend/src/pages/Me/FriendsPage/Pending/index.js
discord-clone-main/frontend/src/pages/Me/FriendsPage/index.js
discord-clone-main/frontend/src/pages/Me/FriendsPage/utils.js
discord-clone-main/frontend/src/pages/Me/InnerProfile.js
discord-clone-main/frontend/src/pages/Me/index.js
discord-clone-main/frontend/src/pages/Register/index.js
discord-clone-main/frontend/src/store/index.js
discord-clone-main/frontend/src/store/user.js
discord-clone-main/frontend/src/utils/PrivateRoute.js
discord-clone-main/frontend/src/utils/apiErrorHandler.js
discord-clone-main/frontend/src/utils/checkCurrentPath.js
discord-clone-main/frontend/src/utils/dateUtils.js
discord-clone-main/frontend/src/utils/friendObject.js
discord-clone-main/frontend/src/validation/login.schema.js
discord-clone-main/frontend/src/validation/register.schema.js
discord-clone-main/frontend/src/validation/userNameUpdate.schema.js
discord-clone-main/frontend/tailwind.config.js
discord-clone-main/frontend/yarn.lock

```

## فایل‌های package.json

### discord-clone-main/backend/package.json
{
  "name": "server",
  "version": "1.0.0",
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon src/index.js",
    "start": "pm2 start ecosystem.config.json --no-daemon --exp-backoff-restart-delay=50",
    "test": "jest -i --colors --verbose --detectOpenHandles",
    "test:watch": "jest -i --watchAll",
    "coverage": "jest -i --coverage",
    "coverage:coveralls": "jest -i --coverage --coverageReporters=text-lcov | coveralls",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "prettier": "prettier --check **/*.js",
    "prettier:fix": "prettier --write **/*.js",
    "docker:dev": "docker-compose -f docker-compose.dev.yml up"
  },
  "dependencies": {
    "@socket.io/redis-adapter": "^7.1.0",
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "cross-env": "^7.0.0",
    "dotenv": "^10.0.0",
    "express": "^4.17.1",
    "express-mongo-sanitize": "^2.0.0",
    "express-rate-limit": "^5.0.0",
    "helmet": "^4.1.0",
    "http-status": "^1.4.0",
    "joi": "^17.3.0",
    "jsonwebtoken": "^8.5.1",
    "moment": "^2.24.0",
    "mongoose": "^5.7.7",
    "morgan": "^1.9.1",
    "multer": "^1.4.3",
    "nodemailer": "^6.3.1",
    "passport": "^0.4.0",
    "passport-jwt": "^4.0.0",
    "pm2": "^5.1.0",
    "redis": "^4.0.1",
    "short-unique-id": "^4.4.4",
    "socket.io": "^4.2.0",
    "socketio-jwt-auth": "^0.2.1",
    "swagger-jsdoc": "^6.0.8",
    "swagger-ui-express": "^4.1.6",
    "validator": "^13.0.0",
    "winston": "^3.2.1",
    "xss-clean": "^0.1.1"
  },
  "devDependencies": {
    "coveralls": "^3.0.7",
    "eslint": "^7.0.0",
    "eslint-config-airbnb-base": "^14.0.0",
    "eslint-config-prettier": "^8.1.0",
    "eslint-plugin-import": "^2.18.2",
    "eslint-plugin-jest": "^24.0.1",
    "eslint-plugin-prettier": "^3.1.1",
    "eslint-plugin-security": "^1.4.0",
    "faker": "^5.1.0",
    "jest": "^26.0.1",
    "lint-staged": "^11.0.0",
    "node-mocks-http": "^1.8.0",
    "nodemon": "^2.0.0",
    "prettier": "^2.0.5",
    "supertest": "^6.0.1"
  }
}

### discord-clone-main/frontend/package.json
{
  "name": "react-webpack-5-tailwind-2",
  "version": "1.0.1",
  "scripts": {
    "start": "webpack serve --config config/webpack.dev.js",
    "build": "webpack --config config/webpack.prod.js",
    "build-staging": "webpack --config config/webpack.stag.js",
    "prettify": "yarn prettier \"**/*.*(js|jsx)\" --ignore-path=.prettierignore --write",
    "lint": "eslint src --ext .js,.jsx && yarn prettify",
    "lint-fix": "eslint src --ext .js,.jsx --fix && yarn prettify",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "dependencies": {
    "@reduxjs/toolkit": "^1.6.2",
    "add": "^2.0.6",
    "axios": "^0.22.0",
    "classnames": "^2.3.1",
    "formik": "^2.2.9",
    "lodash.get": "^4.4.2",
    "moment": "^2.29.1",
    "react": "^17.0.1",
    "react-dom": "^17.0.1",
    "react-lottie": "^1.2.3",
    "react-query": "^3.25.1",
    "react-redux": "^7.2.5",
    "react-router-dom": "^5.3.0",
    "socket.io-client": "^4.2.0",
    "tailwindcss": "^2.0.2",
    "yarn": "^1.22.15",
    "yup": "^0.32.9"
  },
  "devDependencies": {
    "@babel/core": "^7.12.10",
    "@babel/plugin-proposal-class-properties": "^7.12.1",
    "@babel/plugin-transform-runtime": "^7.15.0",
    "@babel/preset-env": "^7.12.11",
    "@babel/preset-react": "^7.12.10",
    "@pmmmwh/react-refresh-webpack-plugin": "^0.4.3",
    "@svgr/webpack": "^5.5.0",
    "autoprefixer": "^10.2.3",
    "babel-eslint": "^10.1.0",
    "babel-loader": "^8.2.2",
    "clean-webpack-plugin": "^3.0.0",
    "copy-webpack-plugin": "^7.0.0",
    "css-loader": "^5.0.1",
    "css-minimizer-webpack-plugin": "^1.2.0",
    "dotenv-webpack": "^6.0.0",
    "eslint": "^7.18.0",
    "eslint-config-prettier": "^7.2.0",
    "eslint-import-resolver-alias": "^1.1.2",
    "eslint-plugin-babel": "^5.3.1",
    "eslint-plugin-import": "^2.22.1",
    "eslint-plugin-prettier": "^3.3.1",
    "eslint-plugin-react": "^7.22.0",
    "eslint-plugin-react-hooks": "^4.2.0",
    "html-webpack-plugin": "^4.5.1",
    "husky": "^4.3.8",
    "lint-staged": "^10.5.3",
    "mini-css-extract-plugin": "^1.3.4",
    "optimize-css-assets-webpack-plugin": "^5.0.4",
    "postcss": "^8.2.4",
    "postcss-import": "^14.0.0",
    "postcss-loader": "^4.2.0",
    "prettier": "^2.2.1",
    "react-refresh": "^0.9.0",
    "sass": "^1.52.3",
    "sass-loader": "^10.1.1",
    "style-loader": "^2.0.0",
    "terser-webpack-plugin": "^5.1.1",
    "webpack": "^5.17.0",
    "webpack-cli": "^4.4.0",
    "webpack-dev-server": "^3.11.2",
    "webpack-merge": "^5.7.3"
  }
}

## فایل‌های راهنمای پروژه
discord-clone-main/README.md
discord-clone-main/backend/README.md
discord-clone-main/frontend/README.md

## SOURCE: frontend/.env.production
```
API_URL=https://discord-react-clone-backend.herokuapp.com

```

## SOURCE: frontend/config/paths.js
```
const path = require('path')

module.exports = {
  // Source files
  src: path.resolve(__dirname, '../src'),

  // Production build files
  build: path.resolve(__dirname, '../build'),

  // Static files that get copied to build folder
  public: path.resolve(__dirname, '../public'),
}

```

## SOURCE: frontend/config/webpack.prod.js
```
const paths = require('./paths')
const Dotenv = require('dotenv-webpack')
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  output: {
    path: paths.build,
    publicPath: '/',
    filename: 'js/[name].[contenthash].bundle.js',
  },
  plugins: [
    new Dotenv({
      path: './.env.production',
    }),
    // Extracts CSS into separate files
    // Note: style-loader is for development, MiniCssExtractPlugin is for production
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
      chunkFilename: '[id].css',
    }),
  ],
  module: {
    rules: [],
  },
  optimization: {
    minimize: true,
    minimizer: [new OptimizeCssAssetsPlugin(), new TerserPlugin()],
    // Once your build outputs multiple chunks, this option will ensure they share the webpack runtime
    // instead of having their own. This also helps with long-term caching, since the chunks will only
    // change when actual code changes, not the webpack runtime.
    runtimeChunk: {
      name: 'runtime',
    },
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
})

```

## SOURCE: frontend/src/api/client.js
```
import axios from 'axios'
import {
  LOGIN_PAGE,
  LOGIN_URL,
  REFRESH_TOKEN_URL,
} from '../constants/history.constants'

axios.defaults.withCredentials = true

const client = axios.create({
  baseURL: process.env.API_URL,
  withCredentials: true,
})

client.interceptors.request.use(function (config) {
  if (localStorage.user) {
    const userStorage = JSON.parse(localStorage.getItem('user'))
    config.headers.Authorization = `Bearer ${userStorage?.tokens?.access?.token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (err) => {
    const { status } = err.response
    const originalReq = err.config

    if (originalReq.url !== LOGIN_URL && err.response) {
      if (
        err.response.status === 401 &&
        err.response?.data?.message === 'Token not found'
      ) {
        localStorage.removeItem('user')
        window.location.replace(LOGIN_PAGE)
        return Promise.reject()
      }

      if (
        (err.response.status === 401 &&
          err.response?.data?.message === 'Please authenticate',
        err.config && !err.config._retry)
      ) {
        originalReq._retry = true
        const userStorage = JSON.parse(localStorage.getItem('user'))
        const refreshToken = userStorage?.tokens?.refresh?.token

        // request to refresh token
        try {
          const res = await client.post(REFRESH_TOKEN_URL, {
            refreshToken: refreshToken,
          })

          localStorage.setItem('user', JSON.stringify(res.data))
          originalReq.headers[
            'Authorization'
          ] = `Bearer ${res.data?.tokens?.access?.token}`
          originalReq.headers['Device'] = 'device'

          return client(originalReq)
        } catch (_error) {
          return Promise.reject(_error)
        }
      }
    }

    switch (status) {
      case 403:
        localStorage.removeItem('user')
        window.location.replace(LOGIN_PAGE)
        break
      default:
        break
    }

    return Promise.reject(err)
  }
)
export default client

```

## SOURCE: frontend/src/api/auth/index.js
```
import { LOGIN_URL } from '../../constants/history.constants'
import client from '../client'

export const register = (data) => {
  return client.post('/api/v1/auth/register', data)
}
export const login = (data) => {
  return client.post(LOGIN_URL, data)
}

export const logout = (refreshToken) => {
  return client.post('/api/v1/auth/logout', { refreshToken })
}

```

## SOURCE: frontend/public/index.html
```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Discord | Your Place to Talk and Hang Out</title>
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1"
    />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>

```
