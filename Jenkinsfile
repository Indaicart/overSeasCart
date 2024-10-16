pipeline{
    agent {
        label 'docker'
    }
    stages{
        stage("build stage"){
            steps{
                sh "mvn clean install"
            }
        }
    }
}