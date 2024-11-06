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
        stage("build test"){
            steps{
                sh "mvn test"
            }
        }
        stage("sonarqube"){
            steps{
                sh "mvn clean verify sonar:sonar \
                    -Dsonar.projectKey=shopping-cart \
                    -Dsonar.projectName='shopping cart' \
                    -Dsonar.host.url=http://184.73.73.65:9000 \
                    -Dsonar.token=sqp_0de1412e055ed2aa7ea236e9eec04fec9cbeacd4"
                 }
        }
    }
}