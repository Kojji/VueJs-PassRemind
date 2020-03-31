import storeUser from './storeUser'
import storeMisc from './storeMisc'
import firebase from 'firebase'

const state = {
  registriesArray: []
}

const mutations = {
  setRegistriesArray(state, userData) { state.registriesArray = userData }
}

const actions = {
  getUserList({commit}) {
    storeMisc.mutations.setLoading(storeMisc.state, true)
    var firestoreDB = firebase.firestore();
    firestoreDB.collection('users').doc(storeUser.state.userId).collection('entries').get()
    .then(querySnapshot => {
      if(querySnapshot.docs.length > 0) {
        let entriesArray = []
        querySnapshot.forEach(doc => {
          entriesArray.push(doc.data())
        })
        commit("setRegistriesArray", entriesArray)
      } else {
        commit("setRegistriesArray", [])
      }
      storeMisc.mutations.setLoading(storeMisc.state, false)
    })
    .catch(function(error) {
      // eslint-disable-next-line
      console.log("Error getting documents: ", error);
      storeMisc.mutations.setLoading(storeMisc.state, false)
    });
  },
  saveNewEntry({dispatch},userData) {
    var firestoreDB = firebase.firestore();
    let timestamp = new Date().getTime()
    let newObject = Object.assign(userData,{dateStamp: timestamp})
    firestoreDB.collection('users').doc(storeUser.state.userId).collection('entries').doc(userData.service)
    .set(newObject).then(()=>{
      storeMisc.mutations.setSnackOn(storeMisc.state,"Registro criado com sucesso!")
    })
    dispatch('getUserList')
  },
  deleteEntry({dispatch}, userData) {
    var firestoreDB = firebase.firestore();
    firestoreDB.collection('users').doc(storeUser.state.userId).collection('entries').doc(userData.service)
    .delete()
    .then(() => {
      storeMisc.mutations.setSnackOn(storeMisc.state,"Registro apagado com sucesso!")
      dispatch('getUserList')
    }).catch((err)=>{
      alert("Houve um erro ao tentar deletar uma senha, por favor tente novamente mais tarde.")
      // eslint-disable-next-line
      console.log(err)
    })
  },
  editEntry({dispatch}, userData) {
    return new Promise ((res,rej) => {
      var firestoreDB = firebase.firestore();
      if(userData.old.service.toUpperCase() !== userData.new.service.toUpperCase()) {
        let oldDoc = {}
        firestoreDB.collection("users").doc(storeUser.state.userId).collection('entries').doc(userData.old.service).get()
        .then(doc => {
          Object.assign(oldDoc, doc.data())
        })
        let renewed = Object.assign(oldDoc, userData.new)
        firestoreDB.collection("users").doc(storeUser.state.userId).collection('entries').doc(userData.new.service)
        .set(renewed)
        .then(()=>{
          firestoreDB.collection("users").doc(storeUser.state.userId).collection('entries').doc(userData.old.service)
          .delete()
          .then(()=>{
            storeMisc.mutations.setSnackOn(storeMisc.state,"Registro modificado com sucesso!")
            dispatch('getUserList')
            res()
          })
        }).catch((err)=>{
          // eslint-disable-next-line
          console.log(err)
          rej()
        })
      } else {
        firestoreDB.collection('users').doc(storeUser.state.userId).collection('entries').doc(userData.new.service)
        .set(userData.new)
        .then(()=>{
          storeMisc.mutations.setSnackOn(storeMisc.state,"Registro modificado com sucesso!")
          dispatch('getUserList')
          res()
        }).catch(err => {
          rej()
          // eslint-disable-next-line
          console.log(err)
        })
      }
    })
  },
  verifyIfExistNew({state}, userData) { // modificar
    return new Promise ((res,rej) => {
      state.registriesArray.forEach( entry => {
        if(entry.service.toUpperCase() == userData.service.toUpperCase()) {
          rej()
        }
      })
      res()
    })
  },
  verifyIfExistEdit({state}, userData) {
    return new Promise ((res,rej) => {
      if(userData.old.service.toUpperCase() === userData.new.service.toUpperCase()) {
        res()
      } else{
        state.registriesArray.forEach( entry => {
          if(entry.service.toUpperCase() === userData.new.service.toUpperCase()) {
            rej()
          }
        })
        res()
      }
    })
  }
}

const getters ={
  registriesArray(state) { return state.registriesArray }
}

export default {
  state,
  mutations,
  actions,
  getters
}