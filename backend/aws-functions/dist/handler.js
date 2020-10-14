"use strict";
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
exports.get_reps = void 0;
var axios_1 = __importDefault(require("axios"));
var querystring_1 = __importDefault(require("querystring"));
/**
 * takes address as input and queries google civic info
 * and corresponding AWS RDS member info
 * @param event any
 */
exports.get_reps = function (event) {
    if (event === void 0) { event = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
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
        var pgConfig, address, rawReps, officials, ids, params, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pgConfig = {
                        host: "odyssey.cnp1wrwnpclp.us-east-2.rds.amazonaws.com",
                        port: 5432,
                        user: "postgres",
                        password: "never2$$chip",
                        database: "odyssey",
                    };
                    address = "261 dover circle, lake forest";
                    return [4 /*yield*/, findReps(address)];
                case 1:
                    rawReps = _a.sent();
                    officials = rawReps.data.officials;
                    ids = [];
                    officials.forEach(function (element) {
                        if (element.hasOwnProperty("urls") &&
                            Array.isArray(element.urls) &&
                            element.urls.length > 0) {
                            ids.push(Number.parseInt(new URLSearchParams(element.urls[0]).get("MemberID") || "0"));
                        }
                    });
                    params = [];
                    for (i = 1; i <= ids.length; i++) {
                        params.push("$" + i);
                    }
                    /*
                    let pgPool = new pg.Pool(pgConfig);
                    let members = await pgPool.query(
                      `select * from public.members where member_id=(${params.join(", ")})`, ids
                    );
                    await pgPool.end()
                  */
                    return [2 /*return*/, {
                            members: ids,
                        }];
            }
        });
    });
};
