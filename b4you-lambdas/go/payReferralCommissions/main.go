package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type (
	Response           events.APIGatewayProxyResponse
	ReferralCommission struct {
		ID          int `gorm:"primaryKey"`
		IdUser      int
		IdStatus    int
		IdSaleItem  int
		Amount      float32
		ReleaseDate time.Time
	}
)

type ReferralCommissions []ReferralCommission

func connectDB() (*gorm.DB, error) {
	start := time.Now()
	username := os.Getenv("MYSQL_USERNAME")
	password := os.Getenv("MYSQL_PASSWORD")
	dbName := os.Getenv("MYSQL_DATABASE")
	dbHost := os.Getenv("MYSQL_HOST")
	dbURI := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local", username, password, dbHost, dbName)
	db, err := gorm.Open(mysql.Open(dbURI), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		fmt.Println("Error connecting to the database:", err)
		return nil, err
	} else {
		fmt.Println("Database connected successfully")
	}
	duration := time.Since(start)
	fmt.Println("Database connection initialization duration:", duration)
	return db, nil
}

func findCommissions(db *gorm.DB, offset int) ReferralCommissions {
	var commissions ReferralCommissions
	db.Limit(100).Offset(offset).Where("id_status = ? and release_date <= ?", 2, time.Now().Format(time.DateOnly)).Find(&commissions)
	return commissions
}

func handlerResponse() Response {
	var buf bytes.Buffer
	body, err := json.Marshal(map[string]interface{}{
		"message": "Go Serverless v1.0! Your function executed successfully!",
	})
	if err != nil {
		return Response{StatusCode: 404}
	}
	json.HTMLEscape(&buf, body)

	return Response{
		StatusCode:      200,
		IsBase64Encoded: false,
		Body:            buf.String(),
		Headers: map[string]string{
			"Content-Type":           "application/json",
			"X-MyCompany-Func-Reply": "hello-handler",
		},
	}
}

func Handler(ctx context.Context) (Response, error) {
	db, err := connectDB()
	if err != nil {
		fmt.Println(err)
		return Response{StatusCode: 404}, err
	}
	sqlDB, err := db.DB()
	if err != nil {
		return Response{StatusCode: 404}, err
	}
	defer sqlDB.Close()

	offset := 0
	offset = 10
	total := 100
	fmt.Println("Fetching commissions")
	for total != 0 {
		commissions := findCommissions(db, offset)
		fmt.Println("Number of commissions found:", len(commissions))
		total = len(commissions)
		if total < 100 {
			total = 0
		}
		offset += 100
		for _, commission := range commissions {
			fmt.Println("Processing commission:", commission)
			db.Exec("UPDATE referral_balance SET total = ? WHERE id_user = ?", gorm.Expr("total + ?", commission.Amount), commission.IdUser)
			db.Exec("UPDATE referral_commissions SET id_status = ? WHERE id = ?", 3, commission.ID)
		}
	}

	return handlerResponse(), nil
}

func main() {
	lambda.Start(Handler)
}
