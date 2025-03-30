const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  // 진입점 설정 (앱의 시작점)
  entry: './app/index.js',
  
  // 출력 설정
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  
  // 개발 서버 설정
  devServer: {
    contentBase: './dist',
    port: 5500,
    historyApiFallback: true
  },
  
  // 모듈 규칙 설정
  module: {
    rules: [
      // JavaScript 파일 처리
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      // CSS 파일 처리
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      // 이미지 파일 처리
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/'
            }
          }
        ]
      }
    ]
  },
  
  // 플러그인 설정
  plugins: [
    // dotenv 플러그인
    new Dotenv({
      // .env 파일 경로 (기본값은 './.env')
      path: './.env',
      
      // 변수가 정의되지 않았을 때 오류 발생 여부
      safe: true,
      
      // 시스템 환경 변수 허용 여부
      systemvars: true,
      
      // 조용한 모드 (오류를 콘솔에 표시하지 않음)
      silent: false,
      
      // .env 파일이 없을 때 오류 발생 여부
      defaults: false
    })
  ],
  
  // 개발 모드 설정 (production, development, none)
  mode: 'development',
  
  // 소스맵 생성 방식
  devtool: 'inline-source-map'
};