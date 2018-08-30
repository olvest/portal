
import Sequelize from 'sequelize';
import { User, Application, Team, CubStart } from '../models';
var config = require('../config/sequelize').default[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

export default {
    stats: (req, res, next) => {
        const queries = {
            numUsers: 'SELECT COUNT(*) FROM Users',
            numTeams: 'SELECT COUNT(*) FROM Teams',
            numCubStart: 'SELECT COUNT(*) FROM CubStarts',
            numApps: 'SELECT COUNT(*) FROM Applications',
        }

        // executes all queries and puts them in a promise
        Promise.all(Object.keys(queries).map(query => new Promise(resolve => {
            sequelize.query(queries[query]).spread((results, meta) => {
                resolve({
                    [query]: results[Object.keys(results)[0]],
                });
            });
        }))).then(results => {
            res.json(results);
        });
    },

    roster: (req, res, next) => {
        User.findAll({ where: { role: 'admin' } }).then(users => {
            res.json(users);
        });
    },

    deify: (req, res, next) => {
        User.findOne({ where: { email: req.body.email } })
            .then(user => {
                if (!user) {
                    res.redirect('/dashboard#roster');
                } else {
                    user.updateAttributes({
                        role: 'admin',
                    }).then(user => {
                        res.redirect('/dashboard#roster');
                    });
                }

            });
    }
};