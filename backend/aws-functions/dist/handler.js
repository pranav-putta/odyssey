"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.rand_bills = exports.new_user = exports.user_exists = void 0;
var axios_1 = __importDefault(require("axios"));
var pg_1 = __importDefault(require("pg"));
var querystring_1 = __importDefault(require("querystring"));
var fb = __importStar(require("./firebase"));
var aws = __importStar(require("aws-sdk"));
var aws_config_1 = __importDefault(require("./aws.config"));
var current_version = 1;
var pgConfig = {
    host: "odyssey.cnp1wrwnpclp.us-east-2.rds.amazonaws.com",
    port: 5432,
    user: "postgres",
    password: "never2$$chip",
    database: "odyssey",
    statement_timeout: 3000,
    connectionTimeoutMillis: 10000,
};
/**
 * generates an error response message
 * @param message message to display
 */
function createError(message) {
    return {
        statusCode: 400,
        body: JSON.stringify({ error: message }),
    };
}
/**
 * generates a successful response message
 * @param result data to show
 */
function createSuccess(result) {
    return {
        statusCode: 200,
        body: JSON.stringify(__assign({ error: null }, result)),
    };
}
/**
 * checks if the specified user uid exists in the database
 * @param event
 */
exports.user_exists = function (event) {
    if (event === void 0) { event = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var data, client, params, query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = event["queryStringParameters"];
                    if (!(data && data.uid && typeof data.uid === "string")) return [3 /*break*/, 2];
                    // set up dynamodb client
                    aws.config.update(aws_config_1.default.aws_remote_config);
                    client = new aws.DynamoDB.DocumentClient();
                    params = {
                        TableName: aws_config_1.default.aws_table_name,
                        KeyConditionExpression: "uid = :uid",
                        ExpressionAttributeValues: {
                            ":uid": data.uid,
                        },
                    };
                    return [4 /*yield*/, client.query(params).promise()];
                case 1:
                    query = _a.sent();
                    if (((!query.$response.error && query.Count) || 0) > 0) {
                        return [2 /*return*/, createSuccess({ result: true })];
                    }
                    else {
                        return [2 /*return*/, createSuccess({ result: false })];
                    }
                    return [3 /*break*/, 3];
                case 2: return [2 /*return*/, createError("couldn't find uid!")];
                case 3: return [2 /*return*/];
            }
        });
    });
};
/**
 * creates a new entry in users table with the supplied info
 * @param event user information
 */
exports.new_user = function (event) {
    if (event === void 0) { event = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var data, client, params, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = JSON.parse(event.body);
                    if (!data) {
                        return [2 /*return*/, createError("post data could not be parsed")];
                    }
                    else if (!data.token) {
                        return [2 /*return*/, createError("user token not found!")];
                    }
                    else if (!data.user) {
                        return [2 /*return*/, createError("user data not found!")];
                    }
                    // verify that user exists within the database
                    fb.init();
                    return [4 /*yield*/, fb.verifyUser(data.token)];
                case 1:
                    if (!(_a.sent())) {
                        return [2 /*return*/, createError("specified user doesn't exist in database!")];
                    }
                    if (!data.user) {
                        return [2 /*return*/, createError("no user information provided!")];
                    }
                    // set up dynamodb client
                    aws.config.update(aws_config_1.default.aws_remote_config);
                    client = new aws.DynamoDB.DocumentClient();
                    params = {
                        TableName: aws_config_1.default.aws_table_name,
                        Item: data.user,
                    };
                    return [4 /*yield*/, client.put(params).promise()];
                case 2:
                    response = _a.sent();
                    if (response.$response.error) {
                        return [2 /*return*/, createError(JSON.stringify(response.$response.error))];
                    }
                    else {
                        return [2 /*return*/, createSuccess({ result: true })];
                    }
                    return [2 /*return*/];
            }
        });
    });
};
/**
 * takes address as input and queries google civic info
 * and corresponding AWS RDS member info
 * @param event supply address
 */
var get_reps = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    /**
     * uses goolge civic info api to find representatives matching address
     * @param address address to query
     */
    function findReps(address) {
        var params = {
            key: "AIzaSyBjX1sd05v_36BG6gmnhUqe3PsSrAnXHlw",
            address: address,
            includeOffices: true,
            levels: "administrativeArea1",
        };
        var ext = querystring_1.default.stringify(params) +
            "&roles=legislatorUpperBody&roles=legislatorLowerBody";
        var url = "https://civicinfo.googleapis.com/civicinfo/v2/representatives?" + ext;
        return axios_1.default.get(url);
    }
    var rawReps, officials, ids_1, params, i, pgPool, members, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, findReps(address)];
            case 1:
                rawReps = _a.sent();
                officials = rawReps.data.officials;
                ids_1 = [];
                officials.forEach(function (element) {
                    if (element.hasOwnProperty("urls") &&
                        Array.isArray(element.urls) &&
                        element.urls.length > 0) {
                        ids_1.push(Number.parseInt(new URLSearchParams(element.urls[0]).get("MemberID") || "0"));
                    }
                });
                params = [];
                for (i = 1; i <= ids_1.length; i++) {
                    params.push("$" + i);
                }
                pgPool = new pg_1.default.Pool(pgConfig);
                return [4 /*yield*/, pgPool.query("select * from public.members where member_id in (" + params.join(", ") + ")", ids_1)];
            case 2:
                members = _a.sent();
                return [4 /*yield*/, pgPool.end()];
            case 3:
                _a.sent();
                return [2 /*return*/, members.rows];
            case 4:
                error_1 = _a.sent();
                console.log(error_1);
                return [2 /*return*/, []];
            case 5: return [2 /*return*/];
        }
    });
}); };
/**
 * generates random bill
 * @param event
 */
exports.rand_bills = function (event) {
    if (event === void 0) { event = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var pgPool, bills, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pgPool = new pg_1.default.Pool(pgConfig);
                    return [4 /*yield*/, pgPool.query("select * from public.bills where category != 'Other' and category != 'DNE' order by random() limit 20")];
                case 1:
                    bills = _a.sent();
                    return [4 /*yield*/, pgPool.end()];
                case 2:
                    _a.sent();
                    response = {
                        bills: bills.rows,
                    };
                    return [2 /*return*/, { statusCode: 200, body: JSON.stringify(response) }];
            }
        });
    });
};
exports.refresh = function (event) {
    if (event === void 0) { event = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var data, uid, client, params;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = JSON.parse(event.body);
                    if (!data) {
                        return [2 /*return*/, createError("post data could not be parsed")];
                    }
                    uid = data.uid;
                    // set up dynamodb client
                    aws.config.update(aws_config_1.default.aws_remote_config);
                    client = new aws.DynamoDB.DocumentClient();
                    params = {
                        TableName: aws_config_1.default.aws_table_name,
                        KeyConditionExpression: "uid = :uid",
                        ExpressionAttributeValues: {
                            ":uid": data.uid,
                        },
                    };
                    return [4 /*yield*/, client
                            .query(params)
                            .promise()
                            .then(function (response) { return __awaiter(void 0, void 0, void 0, function () {
                            var body, reps;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if ((response.Count || 0) < 1 || !response.Items) {
                                            return [2 /*return*/, createError("no matching users found")];
                                        }
                                        body = {
                                            userData: response.Items[0],
                                            version: current_version,
                                            reps: [],
                                            error: "",
                                            data: {},
                                        };
                                        // check address
                                        if (!body.userData.address) {
                                            return [2 /*return*/, createError("address not found")];
                                        }
                                        return [4 /*yield*/, get_reps(body.userData.address)];
                                    case 1:
                                        reps = _a.sent();
                                        if (!reps) {
                                            body.error = "reps couldn't be found";
                                        }
                                        body.reps = reps;
                                        // if data version is not up to date, return new documents
                                        if (data.version && data.version != current_version) {
                                            body.data = {};
                                        }
                                        return [2 /*return*/, createSuccess(body)];
                                }
                            });
                        }); })
                            .catch(function (err) {
                            return createError(JSON.stringify(err));
                        })];
                case 1: 
                // look for document with specified uid
                return [2 /*return*/, _a.sent()];
            }
        });
    });
};
