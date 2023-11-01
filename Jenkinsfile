pipeline{
    agent any
    stages{
        stage('Build mvn packages'){
            steps{
                sh 'mvn clean install'

            }
        }
         stage('Build mvn packages'){
            steps{
                sh 'mvn test'

            }
        }
    }
}