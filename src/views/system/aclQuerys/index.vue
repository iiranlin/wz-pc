<template>
    <div class="app-container app-container-selection" :style="{ '--theme': theme }">
        <el-tabs v-model="activeName" class="app-container-tabs">
            <el-tab-pane label="按角色查询" name="role">
                <roleList></roleList>
            </el-tab-pane>
            <el-tab-pane label="按用户查询" name="user">
                <userList></userList>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import roleList from "./components/roleList";
import userList from "./components/userList";
export default {
    name: "aclQuerys",
    components: { roleList, userList },
    data() {
        return {
            activeName: 'role'
        };
    },
    computed: {
        theme() {
            return this.$store.state.settings.theme;
        },
    },
    methods: {
    },
};
</script>
<style lang="scss" scoped>
.app-container-tabs{
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-top: 10px;
    ::v-deep .el-tabs__nav{
        margin-left: 20px;
        .el-tabs__item{
            border: 1px solid #dfe4ed;
            padding: 0 10px;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            margin-right: 5px;
        }
    }
    ::v-deep .el-tabs__content{
        flex: 1;
        .el-tab-pane{
            height: 100%;
        }
    }
}
</style>