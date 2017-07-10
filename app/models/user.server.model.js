const mongoose = require('mongoose');
const crypto = require('crypto');

const Schema = mongoose.Schema;
const UserSchema = new Schema ({
    firstName: {
        type: String,
        required: 'First name is required'
    },
    lastName: {
        type: String,
        required: 'Last name is required'
    },
    email: {
        type: String,
        match: [/.+\@.+\..+/, "Please fill a valid e-mail address"],
        trim: true,
        unique: true,
        required: 'Email address is required'
    },
    username: {
        type: String,
        trim: true,
        unique: true,
        required: 'Username is required'
    },
    password: {
        type: String,
        required: 'Password is required',
        validate: [(password) => {
            return password && password.length > 6;
        }, 'Password should be longer'],
    },
    salt: {
        type: String
    },
    provider: {
        type: String,
        required: 'Provider is required'
    },
    providerId: String,
    providerData: {},
    created: {
        type: Date,
        default: Date.now
    }
});

UserSchema.virtual('fullName').get(function() {
    return this.firstName + ' ' + this.lastName;
}).set( (fullName) => {
    const splitName = fullName.split(' ');
    this.firstName = splitName[0] || '';
    this.lastName = splitName[1] || '';
});

//Hash the password before saving it to database
UserSchema.pre('save', function(next) {
    if(this.password) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }
    next();
});
//Hash the password
UserSchema.methods.hashPassword = function(password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
}

UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
}

UserSchema.statics.findUniqueUsername = function(username, suffix, cb) {
    var possibleUsername = username + (suffix || '');
    this.findOne({
        username: possibleUsername
    }, (err, user) => {
        if(!err) {
            if(!user) {
                cb(possibleUsername);
            } else {
                return this.findUniqueUsername(username, (suffix || 0)+1, cb);
            }
        } else {
            cb(null);
        }
    });
};

UserSchema.set('toJSON', {
    getters: true,
    virtuals: true
});


mongoose.model('User', UserSchema);