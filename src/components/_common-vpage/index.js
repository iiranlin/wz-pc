import buttonTop from "./buttonTop";
import tableIndex from "./tableIndex";
import formData from "./formData";
import Pagination from "./Pagination";
import RightToolbar from "./RightToolbar";

const components = [tableIndex, formData, buttonTop, Pagination, RightToolbar]

export default {
    install(vue) {
        components.forEach(component => {
            vue.component(component.name, component)
        })
    }
}