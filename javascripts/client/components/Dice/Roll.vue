<script>
    export default {
        props: ['rolling'],
        data() {
            return {
                number: null,
                timeout: null
            }
        },
        mounted() {
            this.render();
        },
        beforeDestroy() {
            clearTimeout(this.timeout);
        },
        methods: {
            render() {
                let self = this;
                if(this.rolling) {
                    this.timeout = setTimeout(function () {
                        self.number = Math.ceil(Math.random() * 6);
                        self.render();
                    }, 20);
                } else {
                    this.timeout = setTimeout(function () {
                        self.$emit('rolled', self.number);
                    }, 1000);
                }
            },
            makeClass() {
                return 'roll_' + this.number;
            }
        }
    }
</script>

<template>
    <div :class="makeClass()">
        <span v-for="index in number"></span>
    </div>
</template>