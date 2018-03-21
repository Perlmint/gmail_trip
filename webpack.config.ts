import htmlWebpackPlugin from "html-webpack-plugin";
import { join } from "path";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import webpack from "webpack";

const config: webpack.Configuration = {
    devtool: "#source-map",
    entry: join(__dirname, "src/index.tsx"),
    mode: "development",
    module: {
        rules: [
            {
                test: /\.txt$/,
                use: "raw-loader",
            },
            {
                test: /\.tsx?$/,
                use: [
                    "cache-loader",
                    "ts-loader",
                ],
            },
        ],
    },
    output: {
        filename: "[chunkhash].js",
        path: join(__dirname, "dist"),
    },
    plugins: [
        new htmlWebpackPlugin({
            template: join(__dirname, "src/index.html"),
        }),
    ],
    resolve: {
        extensions: [
            ".ts",
            ".tsx",
            ".js",
            ".json",
        ],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: "./src/tsconfig.json",
            }),
        ],
    },
    target: "web",
};

export default config;
