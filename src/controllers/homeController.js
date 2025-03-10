import db from '../models/index';
import CRUDService from '../services/CRUDService';

let getHomePage = async (req, res) => {
    try {
        let data = await db.TaiKhoans.findAll();
        return res.render("homepage.ejs", { data: JSON.stringify(data) });
    } catch (e) {
        console.log(e)
    }
}

let userRegister = (req, res) => {
    return res.render('register.ejs');
}

let saveTodb = async (req, res) => {
    await CRUDService.createNewUser(req.body)
    console.log(req.body);
    return res.send('post crud from server')
}

let userShow = async (req, res) => {
    let data = await CRUDService.getAllUser();
    console.log('=-----------------------------------------------=');
    console.log(data);
    console.log('=-----------------------------------------------=');
    return res.render('list-user.ejs', {
        dataTable: data
    });
}

let userEdit = async (req, res) => {
    let maTK = req.query.matk;
    if (maTK) {
        let userData = await CRUDService.getTaiKhoanMATK(maTK);

        return res.render('edit-user.ejs', {
            user: userData,
        })
    } else {
        return res.send("User not found");
    }
}

let updateTodb = async (req, res) => {
    let data = req.body;
    let allUsers = await CRUDService.updateUser(data);
    return res.redirect("/list-user");
    // return res.render('list-user.ejs', {
    //     dataTable: allUsers
    // });

}

module.exports = {
    getHomePage: getHomePage,
    userRegister: userRegister,
    saveTodb: saveTodb,
    userShow: userShow,
    userEdit: userEdit,
    updateTodb: updateTodb,
}