import FirestoreSubscription
    from 'app/helpers/FirestoreSubscription';
import firebase
    from 'firebase';
import ErrorModals
    from 'app/helpers/ErrorModals';
import QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot;

export default class Subscriptions extends FirestoreSubscription {
    protected static registrations: { [p: string]: Function } = {
        'auth.user': ({vue, options}: { vue: Vue, options: { auth: { uid: string }, callback: Function } }) => {
            if (!Subscriptions.get().hasSubscription('auth.user')) {
                const subscription = vue.$firebase.firestore()
                    .collection('users').doc(options.auth.uid)
                    .onSnapshot((snapshot: { exists: boolean, data: Function }) => {
                        if (snapshot.exists) {
                            vue.$store.commit('auth/SET_USER', {user: snapshot.data()});
                            options.callback(snapshot);
                        }
                    });

                Subscriptions.get().subscribe('auth.user', subscription);
            }
        },

        'auth.roles': ({vue, options}: { vue: Vue, options: { user: QueryDocumentSnapshot, company: { id: string } } }) => {
            if (!Subscriptions.get().hasSubscription(`auth.${options.company.id}.roles`)) {
                const subscription = options.user.ref.collection('roles')
                    .where('belongsTo', 'array-contains', `${options.company.id} companies`)
                    .onSnapshot(async (snapshot) => {
                        const promises = snapshot.docs.map((role) => {
                            return vue.$firebase.firestore().collection('roles').doc(role.id).get();
                        });

                        const roles = await Promise.all(promises);

                        vue.$store.commit('auth/SET_ROLES', {
                            roles: roles.map((role) => {
                                return role.data();
                            })
                        });
                    });

                Subscriptions.get().subscribe(`auth.${options.company.id}.roles`, subscription);
            }
        },

        'auth.settings': ({vue, options}: { vue: Vue, options: { [p: string]: any } }) => {
            if (!Subscriptions.get().hasSubscription(`auth.${options.company.id}.settings`)) {
                const subscription = vue.$firebase.firestore()
                    .collection('users').doc(vue.$firebase.auth().currentUser?.uid)
                    .collection('settings')
                    .where('belongsTo', 'array-contains', `${options.company.id} companies`)
                    .onSnapshot((snapshot: { empty: boolean, docs: Array<{ get: Function, data: Function }> }) => {
                        if (snapshot.empty) {
                            ErrorModals.show({
                                name: 'missing user settings',
                                vue
                            });
                            vue.$firebase.auth().signOut();
                        } else {
                            if (/inactive/i.test(snapshot.docs[0].get('status'))) {
                                ErrorModals.show({
                                    name: 'inactive user',
                                    vue
                                });
                                vue.$firebase.auth().signOut();
                            } else {
                                vue.$store.commit('auth/SET_SETTINGS', {settings: snapshot.docs[0].data()});
                            }
                        }
                    });

                Subscriptions.get().subscribe(`auth.${options.company.id}.settings`, subscription);
            }
        },

        'auth.company': ({vue, options}: { vue: Vue, options: { company: { id: string } } }) => {
            if (!Subscriptions.get().hasSubscription(`auth.${options.company.id}.company`)) {
                const subscription = vue.$firebase.firestore().collection('companies').doc(options.company.id)
                    .onSnapshot((snapshot: { exists: boolean, data: Function }) => {
                        if (snapshot.exists) {
                            vue.$store.commit('auth/SET_COMPANY', {company: snapshot.data()});
                        }
                    });

                Subscriptions.get().subscribe(`auth.${options.company.id}.company`, subscription);
            }
        },

        'auth.companies': ({vue, options}: { vue: Vue, options: { user: QueryDocumentSnapshot } }) => {
            if (!Subscriptions.get().hasSubscription('auth.companies')) {
                const subscription = options.user.ref.collection('companies')
                    .onSnapshot(async (snapshot) => {
                        const promises = snapshot.docs.map((company) => {
                            return vue.$firebase.firestore().collection('companies').doc(company.get('id')).get();
                        });

                        const companies = await Promise.all(promises);

                        vue.$store.commit('auth/SET_COMPANIES', {
                            companies: companies.map((company) => {
                                return company.data();
                            })
                        });
                    });

                Subscriptions.get().subscribe('auth.companies', subscription);
            }
        },

        'app.companies': ({vue}: { vue: Vue }) => {
            if (!Subscriptions.get().hasSubscription('app.companies')) {
                const subscription = vue.$firebase.firestore().collection('companies')
                    .onSnapshot((snapshot: { docs: Array<{ data: Function }> }) => {
                        vue.$store.commit('app/SET_COMPANIES', {
                            companies: snapshot.docs.map((document: { data: Function }) => {
                                return document.data();
                            })
                        });
                    });

                Subscriptions.get().subscribe('app.companies', subscription);
            }
        },

        'app.roles': ({vue}: { vue: Vue }) => {
            if (!Subscriptions.get().hasSubscription('app.roles')) {
                const subscription = vue.$firebase.firestore().collection('roles')
                    .onSnapshot((snapshot: { docs: Array<{ data: Function }> }) => {
                        vue.$store.commit('app/SET_ROLES', {
                            roles: snapshot.docs.map((role) => {
                                return role.data();
                            })
                        });
                    });

                Subscriptions.get().subscribe('app.roles', subscription);
            }
        },

        'company.users': ({vue, options}: { vue: Vue, options: { company: { id: string } } }) => {
            if (!Subscriptions.get().hasSubscription(`company.${options.company.id}.users`)) {
                const subscription = vue.$firebase.firestore().collection('users')
                    .where('belongsTo', 'array-contains', `${options.company.id} companies`)
                    .onSnapshot((snapshot: { docs: Array<any> }) => {
                        vue.$store.dispatch('company/setUsers', {
                            users: snapshot.docs.map((document: { data: Function }) => {
                                return document.data();
                            })
                        });
                    });

                Subscriptions.get().subscribe(`company.${options.company.id}.users`, subscription);
            }
        },

        'company.products': ({vue, options}: { vue: Vue, options: { company: { id: string } } }) => {
            if (!Subscriptions.get().hasSubscription(`company.${options.company.id}.products`)) {
                const subscription = vue.$firebase.firestore().collection('products')
                    .where('belongsTo', 'array-contains', `${options.company.id} companies`)
                    .onSnapshot((snapshot: { docs: Array<any> }) => {
                        vue.$store.dispatch('company/setProducts', {
                            products: snapshot.docs.map((document: { data: Function }) => {
                                return document.data();
                            })
                        });
                    });

                Subscriptions.get().subscribe(`company.${options.company.id}.products`, subscription);
            }
        },

        'company.settings': ({vue, options}: { vue: Vue, options: { company: { id: string } } }) => {
            if (!Subscriptions.get().hasSubscription(`company.${options.company.id}.settings`)) {
                const subscription = vue.$firebase.firestore().collection('companies')
                    .doc(options.company.id).collection('settings')
                    .onSnapshot((snapshot: { docs: Array<any>, empty: boolean }) => {
                        vue.$store.commit('company/SET_SETTINGS', {
                            settings: snapshot.empty ? {} : snapshot.docs[0].data()
                        });
                    });

                Subscriptions.get().subscribe(`company.${options.company.id}.settings`, subscription);
            }
        },

        'company.leads': ({vue, options}: { vue: Vue, options: { company: { id: string } } }) => {
            if (!Subscriptions.get().hasSubscription(`company.${options.company.id}.leads`)) {
                const subscription = vue.$firebase.firestore().collection('leads')
                    .where('belongsTo', 'array-contains', `${options.company.id} companies`)
                    .onSnapshot(async (snapshot) => {
                        const promises = snapshot.docs.map((lead) => {
                            return vue.$firebase.firestore().collection('leads').doc(lead.get('id')).get();
                        });

                        const leads = await Promise.all(promises);

                        vue.$store.commit('company/SET_LEADS', {
                            leads: leads.map((lead) => {
                                return lead.data();
                            })
                        });
                    });

                Subscriptions.get().subscribe(`company.${options.company.id}.leads`, subscription);
            }
        },
        'account.equipment': ({vue, options}: { vue: Vue, options: { account: { id: string } } }) => {
            if (!Subscriptions.get().hasSubscription(`account.${options.account.id}.equipment`)) {
                console.log('options:', options);
                const subscription = vue.$firebase.firestore().collection('installs')
                    .where('belongsTo', 'array-contains', `${options.account.id} accounts`)
                    .onSnapshot(async (snapshot) => {

                        //is this unused code now? 216-218
                        const promises = snapshot.docs.map((equipment) => {
                            return vue.$firebase.firestore().collection('installs').doc(equipment.get('id')).get();
                        });

                        snapshot.docs.forEach((install) => {
                            return vue.$firebase.firestore().collection('equipment')
                                .where('belongsTo', 'array-contains', `${install.id} installs`)
                                .onSnapshot((snapshot) => {
                                    if (!snapshot.empty) {
                                        vue.$store.commit('accounts/SET_EQUIPMENT',
                                            {
                                                equipment: snapshot.docs.map((equipment: any) => {
                                                    return equipment.data()
                                                }), install: install.data()
                                            })

                                    }
                                });
                        });

                        const equipment = await Promise.all(promises);

                        // vue.$store.commit('accounts/SET_EQUIPMENT', {
                        //     equipment: equipment.map((object) => {
                        //         return object.data();
                        //     })
                        // });
                    });



                Subscriptions.get().subscribe(`account.${options.account.id}.equipment`, subscription);

            }
        },

        'company.accounts': ({vue, options}: { vue: Vue, options: { company: { id: string } } }) => {
            if (!Subscriptions.get().hasSubscription(`company.${options.company.id}.accounts`)) {
                const subscription = vue.$firebase.firestore().collection('accounts')
                    .where('belongsTo', 'array-contains', `${options.company.id} companies`)
                    .onSnapshot(async (snapshot) => {
                        const promises = snapshot.docs.map((account) => {
                            return vue.$firebase.firestore().collection('accounts').doc(account.get('id')).get();
                        });

                        snapshot.docs.forEach((account) => {
                            return vue.$firebase.firestore().collection('contacts')
                                .where('belongsTo', 'array-contains', `${account.id} accounts`)
                                .onSnapshot((snapshot) => {
                                    if (!snapshot.empty) {
                                        vue.$store.commit('accounts/SET_CONTACTS',
                                            {
                                                contacts: snapshot.docs.map((contact: any) => {
                                                    return contact.data()
                                                }), account: account.data()
                                            });

                                        //set the emails in the state
                                        snapshot.docs.forEach((contact) => {
                                            vue.$firebase.firestore().collection('emails')
                                                .where('belongsTo', 'array-contains', `${contact.data().id} contacts`)
                                                .onSnapshot((snapshot) => {
                                                    if(!snapshot.empty){
                                                        vue.$store.commit('contacts/SET_EMAILS',{
                                                            emails: snapshot.docs.map((email:any)=>{
                                                                return email.data()
                                                        }), contact: contact.data()
                                                        })
                                                    }
                                                })
                                        });

                                        //set the phones in the state
                                        snapshot.docs.forEach((contact) => {
                                            vue.$firebase.firestore().collection('phones')
                                                .where('belongsTo', 'array-contains', `${contact.data().id} contacts`)
                                                .onSnapshot((snapshot) => {
                                                    if(!snapshot.empty){
                                                        vue.$store.commit('contacts/SET_PHONES',{
                                                            phones: snapshot.docs.map((phone:any)=>{
                                                                return phone.data()
                                                            }), contact: contact.data()
                                                        })
                                                    }
                                                })
                                        });


                                    }
                                });
                        });

                        snapshot.docs.forEach((account) => {
                            return vue.$firebase.firestore().collection('addresses')
                                .where('belongsTo', 'array-contains', `${account.id} accounts`)
                                .onSnapshot((snapshot) => {
                                    if (!snapshot.empty) {
                                        vue.$store.commit('accounts/SET_ADDRESSES',
                                            {
                                                addresses: snapshot.docs.map((address: any) => {
                                                    return address.data()
                                                }), account: account.data()
                                            })

                                    }
                                });
                        });

                        const accounts = await Promise.all(promises);

                        vue.$store.commit('company/SET_ACCOUNTS', {
                            accounts: accounts.map((account) => {
                                return account.data();
                            })
                        });

                    });

                Subscriptions.get().subscribe(`company.${options.company.id}.accounts`, subscription);
            }
        },

        // ROUTE CHANGE SUBSCRIPTIONS
        'watch.company.route': ({vue, options}: { vue: Vue, options: { name: string } }) => {
            const subscription = vue.$store.watch(() => vue.$route.fullPath, () => {
                Subscriptions.get().unsubscribe([
                    `${options.name}.update`,
                    `${options.name}.emails`,
                    `${options.name}.phones`,
                    `${options.name}.addresses`,
                    `${options.name}.settings`,
                    `${options.name}.company`
                ]);
            });

            Subscriptions.get().replace(`${options.name}.update`, subscription);
        },

        'watch.user.route': ({vue, options}: { vue: Vue, options: { name: string } }) => {
            const subscription = vue.$store.watch(() => vue.$route.fullPath, () => {
                Subscriptions.get().unsubscribe([
                    `${options.name}.update`,
                    `${options.name}.emails`,
                    `${options.name}.phones`,
                    `${options.name}.addresses`,
                    `${options.name}.settings`
                ]);
            });

            Subscriptions.get().replace(`${options.name}.update`, subscription);
        },

        'watch.account.route': ({vue, options}: { vue: Vue, options: { name: string, id: string } }) => {
            const subscription = vue.$store.watch(() => vue.$route.fullPath, () => {
                Subscriptions.get().unsubscribe([
                    `${options.name}.update`,
                    `company-account.${options.id}`,
                    `account-contact.${options.id}.emails`,
                    `account-contact.${options.id}.phones`,
                    `account-contact.${options.id}.addresses`
                ]);
            });

            Subscriptions.get().replace(`${options.name}.update`, subscription);
        }
    };

    protected static subscriptions = Subscriptions.create();

    public static get() {
        return this.subscriptions;
    }

    public static subscribe(params: { name: string | Array<string>, vue: Vue, options?: { [p: string]: any } }) {
        const {name, ...rest} = params;
        if (Array.isArray(name)) {
            name.forEach((name) => {
                return Subscriptions.registrations[name](rest);
            });
        } else {
            return Subscriptions.registrations[name](rest);
        }
    }
}
