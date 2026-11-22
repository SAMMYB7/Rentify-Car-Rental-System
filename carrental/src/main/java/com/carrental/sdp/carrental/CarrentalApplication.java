package com.carrental.sdp.carrental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // runs BookingMaintenanceJob (releases expired unpaid bookings, completes finished trips)
public class CarrentalApplication {

	public static void main(String[] args) {
		SpringApplication.run(CarrentalApplication.class, args);
		System.out.println("Spring Boot Project is Running!!!");
	}

}
