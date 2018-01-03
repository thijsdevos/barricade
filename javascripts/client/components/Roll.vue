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
                if(this.rolling) {
                    let self = this;
                    this.timeout = setTimeout(function () {
                        self.number = Math.ceil(Math.random() * 6);
                        self.render();
                    }, 20);
                } else {
                    this.$emit('rolled', this.number);
                }
            }
        }
    }
</script>

<template>
    <span>{{ number }}</span>
</template>