import htmlWebpackPlugin from "html-webpack-plugin";
import { join } from "path";
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
        filename: "[hash].js",
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
    },
    target: "web",
};

export default config;
